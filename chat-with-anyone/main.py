import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict
import uuid

# --- Configuration ---
app = FastAPI(
    title="Anonymous Chat Service",
    description="WebSocket implementation for anonymous chatting",
    version="2.0.0",
)

# Add CORS middleware - CRITICAL for WebSocket connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- State Management ---
active_users: Dict[WebSocket, Dict] = {}
waiting_user: Optional[WebSocket] = None

@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "Anonymous Chat Service"}

@app.get("/ws-test")
async def websocket_test():
    """Test if WebSocket endpoint is accessible"""
    return {"message": "WebSocket endpoint is available at /ws"}

@app.websocket("/ws")
async def chat_endpoint(websocket: WebSocket):
    global waiting_user, active_users
    
    client_id = str(uuid.uuid4())[:8]
    print(f"🔗 New WebSocket connection attempt from {websocket.client}, ID: {client_id}")
    
    try:
        await websocket.accept()
        print(f"✅ WebSocket connection established: {client_id}")
        
        active_users[websocket] = {"partner": None, "id": client_id}
        
        # Send immediate confirmation
        await websocket.send_text(f"Connected! Your ID: {client_id}")
        
        # --- Matching Logic ---
        if waiting_user is None:
            waiting_user = websocket
            await websocket.send_text("⏳ Waiting for a partner to join...")
            print(f"🕒 {client_id} is now waiting")
        else:
            partner = waiting_user
            waiting_user = None
            
            # Match found!
            active_users[websocket]["partner"] = partner
            if partner in active_users:
                active_users[partner]["partner"] = websocket
                
                # Notify both users
                await websocket.send_text("✅ Connected with a partner! Start chatting!")
                await partner.send_text("✅ Connected with a partner! Start chatting!")
                print(f"🤝 Matched {client_id} with {active_users[partner]['id']}")
            else:
                # Partner disconnected, requeue current user
                waiting_user = websocket
                await websocket.send_text("❌ Partner disconnected. Waiting for new partner...")
                partner = None

        # --- Message Handling Loop ---
        while True:
            try:
                # Add timeout to prevent hanging
                data = await asyncio.wait_for(websocket.receive_text(), timeout=300.0)  # 5 min timeout
                
                partner = active_users.get(websocket, {}).get("partner")
                
                if partner and partner in active_users:
                    print(f"💬 Message from {client_id} to partner")
                    await partner.send_text(data)
                elif partner is None and waiting_user != websocket:
                    # Partner disconnected mid-chat
                    print(f"🔁 {client_id} partner disconnected, re-queuing")
                    await websocket.send_text("❌ Partner disconnected. Re-queuing for new chat...")
                    waiting_user = websocket
                    active_users[websocket]["partner"] = None
                elif waiting_user == websocket and partner is None:
                    await websocket.send_text("⏳ Still waiting for a partner...")
                    
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                try:
                    await websocket.send_text("ping")
                    continue
                except:
                    break
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"❌ Error in message handling for {client_id}: {e}")
                break

    except WebSocketDisconnect:
        print(f"🔌 WebSocket disconnected: {client_id}")
    except Exception as e:
        print(f"💥 Critical error for {client_id}: {e}")
        
    finally:
        # --- Cleanup ---
        print(f"🧹 Cleaning up {client_id}")
        user_data = active_users.pop(websocket, None)
        
        if user_data:
            partner = user_data.get("partner")
            if partner and partner in active_users:
                print(f"🔁 Notifying partner of {client_id}'s disconnect")
                try:
                    await partner.send_text("❌ Your partner disconnected. Waiting for new match...")
                    active_users[partner]["partner"] = None
                    waiting_user = partner
                except:
                    pass
        
        if waiting_user == websocket:
            waiting_user = None
            print(f"🗑️ Removed {client_id} from waiting queue")

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8080))
    print(f"🚀 Starting WebSocket Anonymous Chat Service on port {port}")
    print(f"📡 WebSocket endpoint: ws://0.0.0.0:{port}/ws")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        # Important for Cloud Run WebSocket performance
        timeout_keep_alive=300,
        timeout_graceful_shutdown=10
    )
