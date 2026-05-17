export default function AdminPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #007869 0%, #005749 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '32px', width: '100%', maxWidth: '384px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Panel Admin</h1>
        </div>

        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Login page loading...
        </p>

        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            console.log('Admin page loaded at', new Date().toISOString());
            document.body.innerHTML += '<p style="position: fixed; bottom: 10px; left: 10px; background: #333; color: white; padding: 10px; font-size: 12px; border-radius: 4px;">Page loaded</p>';
          })();
        `}} />
      </div>
    </div>
  )
}
