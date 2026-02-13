from fastapi import *
from datetime import datetime, timezone, timedelta

# 前後端連線使用
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 設定白名單：只有名單內的「地址」可以進來跟後端拿資料
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允許的來源
    allow_credentials=True,  # 允許憑證 (cookies, auth headers)
    allow_methods=["*"],  # 允許的方法 (GET, POST, etc. "*" 為全部)
    allow_headers=["*"],  # 允許的標頭 ("*" 為全部)
)


@app.get("/api/timer")
async def get_timer(mode: str = "work"):
    # mode = 宣告mode變數是字串 並且預設是 work

    # datetime.now = 取得現在時間
    # (timezone.utc) = 把時間轉換成標準時間
    start_time = datetime.now(timezone.utc)

    if mode == "rest":
        # timedelta(時間差) = 用來算間隔
        end_time = start_time + timedelta(seconds=20)

    elif mode == "long_rest":
        end_time = start_time + timedelta(minutes=20)

    else:
        end_time = start_time + timedelta(minutes=20)

    # isoformat = 把 python的時間格式轉成 ISO 格式的字串
    data = {"start_time": start_time.isoformat(), "end_time": end_time.isoformat()}

    return {"data": data}
