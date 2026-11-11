---
title: 'FastAPI'
pubDate: 2026-07-01
description: '这是fastapi学习笔记'
author: 'Gunazz'
tags: ["python", "learning"]
---

# FASTAPI

## 概述

一个基于 Python 的原生支持异步的高性能 Web 框架。



- 原生支持异步
- 集成 Pydantic 参数校验
- 自动生成 API 文档



uvicorn 是用于运行 FastAPI 服务的服务器。

```
uvicorn main:app --reload
```



## 路由

基本定义：
```python
@app.get("/test")
async def testFun():
    return { "msg": "Hello, World!" }
```



**路径参数**

请求路径示例：/user/1

基本使用：

```python
@app.get("/user/{id}")
async def testFun(id: int):
    return { "msg": "Hello, World!" }
```

路径参数 - 类型注解 Path

| Path参数                   | 说明                                 |
| -------------------------- | ------------------------------------ |
| ...                        | 必填                                 |
| gt / ge<br />lt / le       | 大于 / 大于等于<br />小于 / 小于等于 |
| description                | 描述                                 |
| min_length<br />max_length | 长度限制                             |

示例如下：

```python
@app.get("/user/{id}")
async def testFun(id: int = Path(..., gt=0, lt=101)): # id必填，且0<id<101
    return { "msg": "Hello, World!" }
```



**查询参数**

请求路径示例：/page?num=1&size=10

基本使用：

```python
@app.get("/page")
async def testFun(num: int, size: int=10):
    return { "msg": "Hello, World!" }
```

请求参数 - 类型注解 Query

| Query 参数                 | 说明                                 |
| -------------------------- | ------------------------------------ |
| ...                        | 必填                                 |
| gt / ge<br />lt / le       | 大于 / 大于等于<br />小于 / 小于等于 |
| description                | 描述                                 |
| min_length<br />max_length | 长度限制                             |

示例如下：

```python
@app.get("/user/{id}")
async def testFun(num: int = Path(..., gt=0, lt=101), size: int=10):
    return { "msg": "Hello, World!" }
```



**请求体参数**

基本使用：

```python
# 定义类型
from pydantic import BaseModel

class User(BaseModel):
	username: str
	password: str
```

```python
# 路由定义
@app.post("/login")
async def login(user: User):
    return { "msg": "Hello, World!" }
```

请求体参数 - 类型注解 Field

| Query 参数                 | 说明                                 |
| -------------------------- | ------------------------------------ |
| ...                        | 必填                                 |
| gt / ge<br />lt / le       | 大于 / 大于等于<br />小于 / 小于等于 |
| default                    | 默认值                               |
| description                | 描述                                 |
| min_length<br />max_length | 长度限制                             |

示例如下：

```python
class User(BaseModel):
	username: str = Field(...)
	password: str = Field(...)
```



## 响应

默认情况下，FastAPI 会将路由函数的返回对象，经由 jsonable_encode 转换为 JSON 兼容格式，并包装为 JSONResponse 返回。

若需返回其他非 JSON 数据，FastAPI 中也提供了不同的响应类型。

| 响应类型          | 说明                | 示例                                 |
| ----------------- | ------------------- | ------------------------------------ |
| JSONResponse      | 默认响应，返回 JSON | return { "key": "value" }            |
| HTMLResponse      | 返回 HTML           | return HTMLResponse(html_content)    |
| PlainTextResponse | 返回纯文本          | return PlainTextResponse(plain_text) |
| FileResponse      | 返回文件下载        | return FileResponse(path)            |
| StreamingResponse | 流式响应            | 生成器函数返回数据                   |
| RedirectResponse  | 重定向              | return RedirectResponse(url)         |

响应类型设置方式：

```python
# 装饰器中指定响应类
# 使用场景：固定返回类型（HTML、纯文本）
@app.get("/html", response_class=HTMLResponse)
async def get_html():
    return "<h1>这是一个标题</h1>"


# 直接返回响应对象
# 场景：文件下载、图片、流式响应
@app.get("/download")
async def file_download():
    path = "/usr/cover.png"
    return FileResponse(path)
```

自定义响应类型：

```python
from pydantic import BaseModel

class Book(BaseModel):
    id: int
    title: str
    author: str
    
@app.get("/book/{id}", response_model=Book)
async def get_book(id: int):
    return {
        "id": id,
        "title": "一本书",
        "author": "Gvan"
    }
```



## 异常处理

对于客户端引发的错误（4xx），应使用 fastapi.HTTPException 来中断正常处理流程，并返回标准的错误响应。

```python
@app.get("/book/{id}", response_model=Book)
async def get_book(id: int):
    id_list = [1, 2, 3, 4]
    if id not in id_list:
        raise HTTPException(status_code=404, detail="当前id不存在")
    return {
        "id": id,
        "title": "一本书",
        "author": "Gvan"
    }
```



## 中间件

中间件（Middleware）是每次请求都需执行的函数。

中间件函数会在请求到达实际的路由处理函数之前先执行一次，并在返回客户端时再执行一次。

```python
@app.middleware("http")
async def middleware(request, call_next):
    print("中间件开始处理")
    response = await call_next(request) # 对于路由处理函数处理
    print("中间件结束处理")
    return response
```

多个中间件的执行顺序是自下而上的



## 依赖注入

使用依赖注入，可以共享通用逻辑，提供代码质量。

在 FastAPI 中，可以使用 Depends 对路由函数进行依赖注入：

```python
# 依赖项：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.get("/download/{file_id}")
async def download_file(
        file_id: int,
        db: Session = Depends(get_db)
):
    # 1. 查询数据库
    db_file = db.query(FileRecord).filter(FileRecord.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    # 2. 检查文件是否存在
    if not os.path.exists(db_file.storage_path):
        raise HTTPException(status_code=404, detail="File missing on server")

    # 3. 返回文件流
    return FileResponse(
        path=db_file.storage_path,
        filename=db_file.original_name,  # 下载时显示原始文件名
        media_type="application/octet-stream"
    )
```



## ORM

ORM（Object-RelationMapping，对象映射关系），用于在面向对象编程语言和关系型数据库之间建立映射，使开发者可以使用操作对象的方式对数据库进行交互，而无需直接编写 SQL 语句。

下面将简单概述，SQLAlchemy 这一个 ORM 工具的使用。



首先需要安装的库有：
```
pip install sqlalchemy[asyncio] aiomysql
```

> 拓展：
>
> - sqlalchemy[asyncio] 该版本是 sqlalchemy 的异步增强版本。
> - aiomysql 同样是基于 pymysql 的异步版本。



使用步骤：

**1. 创建数据库引擎**

使用 `create_async_engine` 创建异步引擎

```python
from sqlalchemy.ext.asyncio import create_async_engine

ASYNC_DB_URL = "mysql+aiomysql://roor:123456@127.0.0.1:3306/api_db?charset=utf8mb4"

# 创建异步引擎
async_engine = create_async_engine(
    ASYNC_DB_URL,
    echo=True,  # 输出SQL日志
    pool_size=10,  # 连接池大小
    max_overflow=20,  # 连接池额外连接数
)
```

**2. 定义模型类**

```python
# 基类，继承 DeclarativeBase（包含通用属性和字段的映射）
class Base(DeclarativeBase):
class TimeMixin:
    create_time: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now(), comment="创建时间")
    update_time: Mapped[datetime] = mapped_column(DateTime, insert_default=func.now(), onupdate=func.now(), comment="修改时间")
    
# 定义数据库表对应的模型类
class Book(Base):
	__tablename__="book"
    
	id: Mapped[int] = mapped_column(primary_key=True)
	bookname: Mapped[str] = mapped_column(String(255))
	author: Mapped[str] = mapped_column(String(255))
```

**3. 应用启动创建数据表（视情况是否开启）**

```python
async def create_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
@app.on_event("startup")
async def startup_event():
    await create_tables()
```

**4. 相关 curd 操作**

### **查询**

await db.execute(select(模型类))，返回一个ORM 对象

- scalars().all() 获取所有数据
- scalars().first() 获取第一条数据
- db.get(模型类, 主键值) 获取单条数据



### **条件查询**

select(模型类).where(条件, 条件, ...)

条件：

- 比较条件：==、>、>=、<、<=等
- 模糊查询：like()
- 逻辑查询：&、|、~
- 包含查询：in_()



示例：
```python
router = APIRouter(prefix="/demo", tags=["测试模块"])

# 查询所有数据
@router.get("/all")
async def get_all(db: AsyncSession = Depends(get_db)):
    result  = await db.execute(select(User))
    return result.scalars().all()

# 查询单条数据
@router.get("/one/{uid}")
async def get_one(uid: int, db: AsyncSession = Depends(get_db)):
    # return await db.get(User, uid)

    # result = await db.execute(select(User).where(User.id == uid))
    # return result.scalars().first()

    result = await db.execute(select(User).where(User.username.like("zh%") & (User.age <= 25)))
    return result.scalars().all()
```



### **聚合查询**

聚合计算：func.方法(模型类.属性)

- count
- avg
- max
- min
- sum

示例：
```python
# 计算平均年龄
@router.get("/avg")
async def get_avg(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.avg(User.age)))
    return result.scalar()
```



### **分页查询**

selec().offset((page - 1) * size).limit(size)

- offset：跳过的记录数
- limit：返回的记录数

示例：

```python
# 分页查询
@router.get("/page/{page_num}/{page_size}")
async def get_page(page_num: int, page_size: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).offset((page_num - 1) * page_size).limit(page_size))
    return result.scalars().all()
```



### **新增**

定义ORM对象  -> 添加对象到事务：db.add(模型对象) -> commit提交

示例：
```python
@router.post("/add")
async def add_user(user: UserBase, db: AsyncSession = Depends(get_db)):
    new_user = User(**user.__dict__)
    db.add(new_user)
    await db.commit()
    print(new_user)
    return await db.get(User, new_user.id)
```



### **更新**

查询 get -> 属性重新赋值 -> commit提交

示例:

```python
@router.put("/update/{uid}")
async def update_user(uid: int, user: UserBase, db: AsyncSession = Depends(get_db)):
    db_user = await db.get(User, uid)
    db_user.username = user.username
    db_user.password = user.password
    db_user.age = user.age
    await db.commit()
    return db_user
```



### 删除

查询 get -> db.delete 删除 -> commit 提交

示例：

```python
@router.delete("/delete/{uid}")
async def delete_user(uid: int, db: AsyncSession = Depends(get_db)):
    db_user = await db.get(User, uid)
    await db.delete(db_user)
    await db.commit()
    return db_user
```

