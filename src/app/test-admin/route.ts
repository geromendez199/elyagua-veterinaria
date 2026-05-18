export async function GET() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin</title>
      <style>
        body { font-family: sans-serif; background: #007869; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .box { background: white; color: black; padding: 40px; border-radius: 8px; text-align: center; }
        h1 { margin: 0 0 20px 0; }
        p { margin: 0; color: #666; }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>🏥 Panel Admin</h1>
        <p>Funciona!</p>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  })
}
