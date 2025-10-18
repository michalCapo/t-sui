# Bun Runtime Support - Implementation Notes

## Overview
The t-sui framework now supports both Node.js and Bun runtimes with full WebSocket functionality and server-sent patches for real-time updates.

## Changes Made

### 1. Runtime Detection (`ui.server.ts`)
- Added runtime detection: `IS_BUN = typeof (globalThis as any).Bun !== 'undefined'`
- Split `Listen()` method into `_listenNode()` and `_listenBun()` based on runtime

### 2. WebSocket Implementation (`ui.server.ts`)
- **Updated `wsSend()` function**: 
  - Detects socket type (Bun ServerWebSocket vs Node.js Socket)
  - Uses `socket.send()` for Bun, `socket.write()` with WebSocket framing for Node.js
  
- **Updated `wsPing()` function**:
  - Uses native `socket.ping()` for Bun
  - Falls back to manual WebSocket ping frame construction for Node.js

### 3. Bun Server Implementation (`_listenBun()` method)
- Uses Bun's native `Bun.serve()` API
- Implements WebSocket handlers:
  - `open`: Called on WebSocket connection
  - `message`: Handles incoming messages (ping/pong, invalid target notifications)
  - `close`: Cleanup on connection close
  - `error`: Error handling
  
- Converts Bun's `Request`/`Response` API to Node.js-compatible interfaces for compatibility with existing `_dispatch()` method

### 4. Bun-Specific Handlers
- `handleUpgradeBun()`: Initializes WebSocket connection with session data
- `handleBunMessage()`: Processes incoming WebSocket messages
- `handleBunClose()`: Cleans up on disconnect

### 5. Session Management for Bun
- Extracts session ID from cookies during WebSocket upgrade
- Passes session data via `server.upgrade()` context
- Properly handles Set-Cookie headers for new sessions

### 6. Bug Fixes
- **`getClientIP()` function**: Made compatible with mock requests that lack a socket property
- **Header handling in Bun fetch**: Properly converts Node.js ServerResponse headers to plain objects

### 7. Package.json
- Added `dev:bun` script: `bun examples/main.ts`

## Features Verified

✅ **WebSocket Connection**: Bun and Node.js both establish WebSocket connections correctly
✅ **Real-time Patches**: Clock example updates every second via server patches
✅ **Deferred Content**: Skeleton placeholders are replaced with actual content via WebSocket
✅ **Session Management**: Sessions are properly tracked and maintained
✅ **Form Submissions**: All form handling works via WebSocket patches
✅ **Cross-runtime Compatibility**: Code maintains full backward compatibility with Node.js

## Testing

### Node.js Runtime
```bash
npm install
npm run dev
# or
node --import tsx examples/main.ts
```

### Bun Runtime
```bash
npm run dev:bun
# or
bun examples/main.ts
```

Both runtimes will serve on `http://localhost:1423` with full WebSocket support.

### Test Endpoints
- `/others` - Clock (WS) updates every second
- `/` - Showcase with deferred content loading
- All form routes - Interactive components via WebSocket patches

## Implementation Details

### Message Format
Both runtimes send identical WebSocket messages:
```json
{ "type": "patch", "id": "element-id", "swap": "inline|outline|append|prepend", "html": "..." }
{ "type": "hello", "ok": true }
{ "type": "pong", "t": timestamp }
```

### Browser Integration
The client-side WebSocket handler (in `__ws` script) is unchanged and works identically on both runtimes.

### Performance Considerations
- **Bun**: Uses native WebSocket implementation (faster)
- **Node.js**: Uses manual frame construction (proven, reliable)
- Both maintain identical session management and message protocols
