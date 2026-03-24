from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # 前後端連線使用
from typing import List, Optional, Dict  # 型別提示
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pathlib import Path


app = FastAPI()

# 設定白名單：只有名單內的「地址」可以進來跟後端拿資料
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://i-cares.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允許的來源
    allow_credentials=True,  # 允許憑證 (cookies, auth headers)
    allow_methods=["*"],  # 允許的方法 (GET, POST, etc. "*" 為全部)
    allow_headers=["*"],  # 允許的標頭 ("*" 為全部)
)

completed_work_count = 0
accumulated_work_seconds = 0


@app.get("/api/timer")
async def get_timer(
    mode: str = "work",
    work_time_minutes: float = 20,
    short_rest_time_seconds: int = 20,
    long_rest_time_minutes: float = 20,
    rounds_to_long_rest: int = 5,
):
    global completed_work_count, accumulated_work_seconds

    final_mode = mode

    work_time_seconds = work_time_minutes * 60
    long_rest_time_seconds = long_rest_time_minutes * 60

    if mode == "rest":
        # 每當請求休息，次數就 +1
        completed_work_count += 1

        if (
            completed_work_count >= rounds_to_long_rest
            or accumulated_work_seconds >= 5400
        ):
            final_mode = "long_rest"
            seconds_value = long_rest_time_seconds  # 長休息秒數
            completed_work_count = 0  # 計數歸零
            accumulated_work_seconds = 0
        else:
            seconds_value = short_rest_time_seconds  # 一般休息秒數

    elif mode == "long_rest":  # 預防萬一直接請求長休息
        seconds_value = long_rest_time_seconds  # 長休息秒數
        completed_work_count = 0  # 計數歸零
        accumulated_work_seconds = 0

    else:  # 工作時間
        if accumulated_work_seconds + work_time_seconds > 5400:
            seconds_value = 5400 - accumulated_work_seconds
            accumulated_work_seconds = 5400
        else:
            seconds_value = work_time_seconds
            accumulated_work_seconds += work_time_seconds

    timer_response = {
        "mode": final_mode,  # 告訴前端「最後決定」的模式
        "duration_seconds": seconds_value,
    }
    return {"data": timer_response}


class ConnectionManager:
    def __init__(self):
        # 建立一個 字典 用來 user_id 當作key 用來存詳細資料和連線
        self.active_client_connections: Dict[str, dict] = {}

    # 連線的 function
    async def connect_client(
        self, client_connection: WebSocket, user_id: str, name: str
    ):
        # 同意連線
        await client_connection.accept()
        # 把使用者加到字典中
        self.active_client_connections[user_id] = {
            "ws": client_connection,
            "name": name,
            "isConnected": True,
            "privacyMode": "Public",
            "autoStatus": "閒置中",
        }
        # 有人上線 就廣播更新名單
        await self.broadcast_online_users()

    # 離線的 function
    async def disconnect_client(self, client_connection: WebSocket, user_id: str):
        if user_id in self.active_client_connections:
            # 只有「正在斷線的 ws」等於「字典裡紀錄的最新 ws」時，才執行刪除
            # 這樣舊連線斷線時不會誤刪到剛建立的新連線
            if self.active_client_connections[user_id]["ws"] == client_connection:
                del self.active_client_connections[user_id]
                # 有人離線就廣播更新名單
                await self.broadcast_online_users()

    # 廣播線上名單的 function
    async def broadcast_online_users(self):
        users_list = []
        for uid, data in self.active_client_connections.items():
            users_list.append(
                {
                    "id": uid,
                    "name": data["name"],
                    "isConnected": data["isConnected"],
                    "privacyMode": data["privacyMode"],
                    "autoStatus": data["autoStatus"],
                }
            )
        payload = {"type": "online_users", "users": users_list}
        for data in self.active_client_connections.values():
            await data["ws"].send_json(payload)

    # 發送使用者資料 和 使用者輸入文字 的 Json function (格式是字典)
    async def broadcast_json_messages(self, message_payload: dict):
        payload = {"type": "chat_message", **message_payload}
        for data in self.active_client_connections.values():
            await data["ws"].send_json(payload)


# 讓整個 FastAPI 都能使用這個表
chat_room_manager = ConnectionManager()

# 讀取 .env
load_dotenv(".env.local")

# 初始化 supabase
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.getenv("SUPABASE_SECRET_ROLE_KEY")
supabase_db: Client = create_client(url, key)


@app.websocket("/api/chat")
async def chat_room_endpoint(
    client_connection: WebSocket, user_id: str, name: str = "未知用戶"
):
    # 打開和前端的連線
    await chat_room_manager.connect_client(client_connection, user_id, name)
    try:
        while True:
            # 持續接收前端的 JSON
            incoming_payload = await client_connection.receive_json()

            # 做一個假的連線 用來確保使用者不會斷線
            if incoming_payload.get("type") == "ping":
                await client_connection.send_json({"type": "pong"})  # 回應一個 pong
                continue

            if incoming_payload.get("type") == "status_update":

                if user_id in chat_room_manager.active_client_connections:
                    user_data = chat_room_manager.active_client_connections[user_id]
                    if "autoStatus" in incoming_payload:
                        user_data["autoStatus"] = incoming_payload["autoStatus"]
                    if "privacyMode" in incoming_payload:
                        user_data["privacyMode"] = incoming_payload["privacyMode"]
                    await chat_room_manager.broadcast_online_users()
                continue
            # 寫入supabase 的 messages 表
            try:
                insert_response = (
                    supabase_db.table("messages")
                    .insert(
                        {
                            "user_id": incoming_payload["user_id"],
                            "content": incoming_payload["content"],
                        }
                    )
                    .execute()
                )
                saved_message = insert_response.data[0]
                profile_response = (
                    supabase_db.table("profiles")
                    .select("display_name")
                    .eq("id", incoming_payload["user_id"])
                    .execute()
                )
                display_name = (
                    profile_response.data[0]["display_name"]
                    if profile_response.data
                    else "未設定暱稱"
                )

                data = {
                    "id": saved_message["id"],
                    "user_id": saved_message["user_id"],
                    "display_name": display_name,
                    "content": saved_message["content"],
                    "created_at": saved_message["created_at"],
                }
                await chat_room_manager.broadcast_json_messages(data)
            except Exception as e:
                print(f"寫入資料庫失敗{e}")

    except WebSocketDisconnect:
        await chat_room_manager.disconnect_client(client_connection, user_id)


# 定義前端傳來的資料結構
class FocusRecordCreate(BaseModel):
    user_id: str
    todo_id: Optional[str] = None
    start_time: str
    end_time: str
    duration_seconds: int


@app.post("/api/focus-records")
async def create_focus_record(record: FocusRecordCreate):
    try:
        # 準備存入資料庫的字典
        new_data = {
            "user_id": record.user_id,
            "todo_id": record.todo_id,
            "start_time": record.start_time,
            "end_time": record.end_time,
            "duration_seconds": record.duration_seconds,
        }
        # 執行寫入
        response = supabase_db.table("focus_records").insert(new_data).execute()

        return {"status": "success", "data": response.data, "message": "okay"}
    except Exception as e:

        return {"status": "error", "message": str(e)}


@app.get("/api/focus-records/{user_id}")
async def get_focus_records(user_id: str):
    try:
        # 從資料庫抓使用者的資料(倒序)
        response = (
            supabase_db.table("focus_records")
            # * = 抓取 focus_records的 全部資料 , todos(task_name) = 抓 todos 中的 task_name 欄位資料
            .select("*,todos(task_name)")
            .eq("user_id", user_id)
            .order("start_time", desc=True)
            .execute()
        )

        return {"status": "success", "data": response.data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.delete("/api/focus-records/{record_id}")
async def delete_focus_records(record_id: str):
    try:
        response = (
            supabase_db.table("focus_records").delete().eq("id", record_id).execute()
        )
        if len(response.data) > 0:
            return {"status": "success", "message": f"紀錄{record_id}已刪除"}
        else:
            return {"status": "error", "message": "刪除失敗"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/global-focus-status")
async def get_global_focus_status():
    try:
        response = (
            supabase_db.table("focus_records").select("duration_seconds").execute()
        )

        total_seconds = sum(record["duration_seconds"] for record in response.data)
        return {"status": "success", "total_seconds": total_seconds}
    except Exception as e:
        return {"status": "error", "message": str(e)}
