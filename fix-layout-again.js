const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');

// 1. Remove the closing divs before currency
code = code.replace(
`          )}
        </div>
      </div>


      {activeTab === 'currency' && (`,
`          )}


      {activeTab === 'currency' && (`
);

// 2. Add the closing divs before the Invite Member Modal
code = code.replace(
`      )}


      {/* Invite Member Modal */}`,
`      )}
        </div>
      </div>


      {/* Invite Member Modal */}`
);

fs.writeFileSync('src/app/dashboard/settings/page.tsx', code, 'utf8');
console.log('Fixed layout structure!');
