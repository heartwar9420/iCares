from fastapi import *
from datetime import datetime, timezone, timedelta

# 前後端連線使用
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 設定白名單：只有名單內的「地址」可以進來跟後端拿資料
origins = ["http://localhost:3000", "https://i-cares.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允許的來源
    allow_credentials=True,  # 允許憑證 (cookies, auth headers)
    allow_methods=["*"],  # 允許的方法 (GET, POST, etc. "*" 為全部)
    allow_headers=["*"],  # 允許的標頭 ("*" 為全部)
)

completed_work_count = 0


@app.get("/api/timer")
async def get_timer(mode: str = "work"):
    global completed_work_count
    start_time = datetime.now(timezone.utc)

    final_mode = mode
    seconds_value = 3  # 預設3秒

    if mode == "rest":
        # 每當請求休息，次數就 +1
        completed_work_count += 1

        if completed_work_count >= 3:
            final_mode = "long_rest"
            seconds_value = 5  # 長休息秒數
            completed_work_count = 0  # 計數歸零
        else:
            seconds_value = 3  # 一般休息秒數

    elif mode == "long_rest":  # 預防萬一直接請求長休息
        seconds_value = 5  # 長休息秒數
        completed_work_count = 0  # 計數歸零

    else:  # 工作時間 3秒
        seconds_value = 4

    duration_seconds = seconds_value
    data = {
        "mode": final_mode,  # 告訴前端「最後決定」的模式
        "duration_seconds": duration_seconds,
    }
    return {"data": data}


# @app.websocket("/path")
# async def websocket_endpoint(websocket: WebSocket):
#     # 接受連線
#     await websocket.accept()
#     while True:
#         # 接收文字資料
#         data = await websocket.receive_text()
#         # 發送回應
#         await websocket.send_text(f"Message text was: {data}")
#         {"user_001":{
#             "status":"work",
#             websocket:"websocket_A"
#         }}
#         {"使用者":{
#             "狀態":"工作中",
#             websocket:"websocket_A" # 這是什麼意思？
#         }}
