export async function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel Admin - El Yagua Veterinaria</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #007869 0%, #005749 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          padding: 32px;
          width: 100%;
          max-width: 384px;
        }
        .header { text-align: center; margin-bottom: 32px; }
        .icon { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 24px; font-weight: bold; color: #1f2937; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 4px; }
        input {
          width: 100%;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 14px;
          outline: none;
        }
        input:focus { border-color: #007869; }
        button {
          width: 100%;
          background: #007869;
          color: white;
          font-weight: bold;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover { background: #005749; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🏥</div>
          <h1>Panel Admin</h1>
        </div>
        <form>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="admin@example.com">
          </div>
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input type="password" id="password" placeholder="••••••••">
          </div>
          <button type="button">Ingresar</button>
        </form>
        <div class="footer">El Yagua Veterinaria — Panel Interno</div>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
