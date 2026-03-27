from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # 前後端連線使用
from typing import Optional, Dict  # 型別提示
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timezone
from datetime import timedelta


app = FastAPI()

# 設定白名單：只有名單內的「地址」可以進來跟後端拿資料
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://i-cares.vercel.app",
    "https://i-cares-develop.vercel.app",
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
    global completed_work_count

    final_mode = mode

    work_time_seconds = work_time_minutes * 60
    long_rest_time_seconds = long_rest_time_minutes * 60

    if mode == "rest":
        # 每當請求休息，次數就 +1
        completed_work_count += 1

        if completed_work_count >= rounds_to_long_rest:
            final_mode = "long_rest"
            seconds_value = long_rest_time_seconds  # 長休息秒數
            completed_work_count = 0  # 計數歸零
        else:
            seconds_value = short_rest_time_seconds  # 一般休息秒數

    elif mode == "long_rest":  # 預防萬一直接請求長休息
        seconds_value = long_rest_time_seconds  # 長休息秒數
        completed_work_count = 0  # 計數歸零

    else:  # 工作時間
        seconds_value = work_time_seconds

    timer_response = {
        "mode": final_mode,  # 告訴前端「最後決定」的模式
        "duration_seconds": seconds_value,
    }
    return {"data": timer_response}


# 接收前端傳來的資料結構
class TimerAction(BaseModel):
    user_id: str
    action: str  # start / pause / reset / complete
    mode: str = "work"
    duration_seconds: int = 1200  # 預設20分鐘
    remaining_seconds: int = 1200  # 暫停時傳入的剩餘秒數


@app.get("/api/timer/state/{user_id}")
async def get_timer_state(user_id: str):
    try:
        response = (
            supabase_db.table("timer_states")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )

        if len(response.data) > 0:
            return {"status": "success", "data": response.data[0]}
        else:
            return {"status": "empty", "message": "無計時器紀錄"}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/api/timer/sync")
async def sync_timer_action(payload: TimerAction):
    # 前端按下開始按鈕後 讓伺服器更新狀態
    try:
        now_utc = datetime.now(timezone.utc)

        updated_data = {
            "user_id": payload.user_id,
            "mode": payload.mode,
            "updated_at": now_utc.isoformat(),
        }
        if payload.action == "start":
            # 在這邊算出預計結束時間
            target_end = now_utc + timedelta(seconds=payload.remaining_seconds)

            updated_data["is_running"] = True
            updated_data["target_end_time"] = target_end.isoformat()
            updated_data["remaining_seconds"] = payload.remaining_seconds

        elif payload.action == "pause":
            updated_data["is_running"] = False
            updated_data["target_end_time"] = None
            updated_data["remaining_seconds"] = payload.remaining_seconds

        elif payload.action == "reset" or payload.action == "complete":
            updated_data["is_running"] = False
            updated_data["target_end_time"] = None
            updated_data["remaining_seconds"] = 0

        response = (
            supabase_db.table("timer_states")
            .upsert(updated_data, on_conflict="user_id")
            .execute()
        )

        return {"status": "success", "data": response.data[0]}

    except Exception as e:
        print(f"同步計時器失敗:{str(e)}")
        return {"status": "error", "message": str(e)}


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

    # 當使用者快速重新連線時，系統不會因為處理舊的斷線訊息，而不小心把新的連線也給踢掉。
    async def disconnect_client(self, client_connection: WebSocket, user_id: str):
        # 檢查使用者是否正在上線中
        if user_id in self.active_client_connections:
            # 只有正在斷線的連線 等於 字典裡紀錄的最新 ws時 才執行刪除
            if self.active_client_connections[user_id]["ws"] == client_connection:
                # 確認是可以刪除的舊連線後就刪除
                del self.active_client_connections[user_id]
                # 有人離線就廣播給所有人更新名單
                await self.broadcast_online_users()

    # 廣播線上名單的 function
    async def broadcast_online_users(self):
        try:
            # 從資料庫抓取最近有活動的 30 個人
            response = (
                supabase_db.table("profiles")
                .select("id, display_name, updated_at, privacy_mode, auto_status")
                .order("updated_at", desc=True)
                .limit(30)
                .execute()
            )
            recent_profiles = response.data

            users_list = []
            for p in recent_profiles:
                uid = p["id"]
                # 檢查是否在 WebSocket 連線中
                is_online = uid in self.active_client_connections

                # 如果在線上，使用即時狀態；如果離線，使用資料庫存的最後狀態
                if is_online:
                    live_data = self.active_client_connections[uid]
                    users_list.append(
                        {
                            "id": uid,
                            "name": live_data["name"],
                            "isConnected": True,
                            "privacyMode": live_data["privacyMode"],
                            "autoStatus": live_data["autoStatus"],
                        }
                    )
                else:
                    users_list.append(
                        {
                            "id": uid,
                            "name": p["display_name"] or "未命名",
                            "isConnected": False,
                            "privacyMode": p["privacy_mode"] or "Public",
                            "autoStatus": "離線中",
                        }
                    )
            users_list.sort(
                key=lambda x: x["isConnected"] and x["privacyMode"] == "Public",
                reverse=True,
            )

            # 廣播出去
            payload = {"type": "online_users", "users": users_list}

            dead_connections = []
            for uid, data in list(self.active_client_connections.items()):
                try:
                    await data["ws"].send_json(payload)
                except Exception:
                    dead_connections.append(uid)

            for uid in dead_connections:
                if uid in self.active_client_connections:
                    del self.active_client_connections[uid]

        except Exception as e:
            print(f"廣播名單失敗: {e}")

    # 發送使用者資料 和 使用者輸入文字 的 Json function (格式是字典)
    async def broadcast_json_messages(self, message_payload: dict):
        payload = {"type": "chat_message", **message_payload}

        dead_connections = []

        for uid, data in self.active_client_connections.items():
            try:
                await data["ws"].send_json(payload)
            except Exception:
                dead_connections.append(uid)
        for uid in dead_connections:
            if uid in self.active_client_connections:
                del self.active_client_connections[uid]


# 讓整個 FastAPI 都能使用這個表
chat_room_manager = ConnectionManager()

# 讀取 .env
load_dotenv(".env.local")

# 初始化 supabase
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.getenv("SUPABASE_SECRET_ROLE_KEY")
supabase_db: Client = create_client(url, key)


@app.websocket("/api/chat")
async def chat_room_endpoint(client_connection: WebSocket, user_id: str, name: str):
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
    except Exception as e:
        print(f"Websocket 發現預期外的錯誤:{e}")


# 定義前端傳來的資料結構
class FocusRecordCreate(BaseModel):
    user_id: str
    todo_id: Optional[str] = None
    start_time: str
    end_time: str
    duration_seconds: int


# 定義已讀狀態的資料結構
class ReadStatusUpdate(BaseModel):
    user_id: str
    message_id: str


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
            .select("*,todos(task_name,icon_name,icon_color)")
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


# 已讀狀態的API路由


@app.post("/api/chat/read-status")
async def update_read_status(status: ReadStatusUpdate):
    try:
        # 準備寫入的資料
        data = {"user_id": status.user_id, "last_read_message_id": status.message_id}

        response = (
            supabase_db.table("user_read_status")
            .upsert(data, on_conflict="user_id")
            .execute()
        )
        return {"status": "success", "message": response.data}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/api/chat/read-status/{user_id}")
async def get_read_status(user_id: str):
    try:
        response = (
            supabase_db.table("user_read_status")
            .select("last_read_message_id")
            .eq("user_id", user_id)
            .execute()
        )
        # 如果有找到紀錄就回傳 message_id 如果沒有 就回傳None
        if len(response.data) > 0:
            last_read_id = response.data[0]["last_read_message_id"]
        else:
            last_read_id = None

        return {"status": "success", "last_read_message_id": last_read_id}

    except Exception as e:
        return {"status": "error", "message": str(e)}
