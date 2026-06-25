const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');

const broken = `      )}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInviteMember}>`;

const fixed = `      )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInviteMember}>`;

code = code.replace(broken, fixed);
fs.writeFileSync('src/app/dashboard/settings/page.tsx', code, 'utf8');
console.log('Fixed broken modal HTML');
