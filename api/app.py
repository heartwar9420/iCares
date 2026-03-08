from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware  # 前後端連線使用
from typing import List  # 型別提示
import datetime  # 日期時間


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
        # 建立一個 陣列(List) 用來放 前端的連線
        self.active_client_connections: List[WebSocket] = []

    # 連線的 function
    async def connect_client(self, client_connection: WebSocket):
        # 同意連線
        await client_connection.accept()
        # 把他 append 到List中
        self.active_client_connections.append(client_connection)

    # 離線的 function
    def disconnect_client(self, client_connection: WebSocket):
        self.active_client_connections.remove(client_connection)

    # 發送使用者資料 和 使用者輸入文字 的 Json function (格式是字典)
    async def broadcast_json_messages(self, message_payload: dict):
        for connection in self.active_client_connections:
            await connection.send_json(message_payload)


# 讓整個 FastAPI 都能使用這個表
chat_room_manager = ConnectionManager()


@app.websocket("/api/chat")
async def chat_room_endpoint(client_connection: WebSocket):
    # 打開和前端的連線
    await chat_room_manager.connect_client(client_connection)
    try:
        while True:
            # 持續接收前端的 JSON
            incoming_payload = await client_connection.receive_json()
            # 統一由後端押上時間
            current_time_string = datetime.datetime.now().strftime("%H:%M")
            incoming_payload["timestamp"] = current_time_string

            # 把收到的 JSON 回傳回去給前端
            await chat_room_manager.broadcast_json_messages(incoming_payload)
    except WebSocketDisconnect:
        chat_room_manager.disconnect_client(client_connection)
