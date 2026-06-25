const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'dashboard', 'settings', 'page.tsx');
let code = fs.readFileSync(pagePath, 'utf8');

code = code.replace(
`            </div>
          )}
        </div>
      </div>


      {activeTab === 'currency' && (`,
`            </div>
          )}

      {activeTab === 'currency' && (`
);

code = code.replace(
`      {/* Invite Member Modal */}`,
`        </div>
      </div>

      {/* Invite Member Modal */}`
);

fs.writeFileSync(pagePath, code, 'utf8');
console.log("Layout fixed");
