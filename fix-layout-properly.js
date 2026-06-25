const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');

// The incorrect insertion is before {activeTab === 'currency' && (
const targetIncorrect = `        </div>
      )}
      </div>
      </div>

      {activeTab === 'currency' && (`;

const replaceIncorrect = `        </div>
      )}

      {activeTab === 'currency' && (`;

if (code.includes(targetIncorrect)) {
  code = code.replace(targetIncorrect, replaceIncorrect);
  console.log("Removed early closing divs.");
} else {
  // Try alternative matching
  const targetAlternative = `        </div>
      )}
        </div>
      </div>

      {activeTab === 'currency' && (`;
  if (code.includes(targetAlternative)) {
    code = code.replace(targetAlternative, `        </div>
      )}

      {activeTab === 'currency' && (`);
    console.log("Removed early closing divs (alternative).");
  } else {
    console.log("Could not find early closing divs!");
  }
}

// Now we need to append them after the checklists block.
const checklistsEnd = `      )}

      {/* Invite Member Modal */}`;

const correctEnd = `      )}
        </div>
      </div>

      {/* Invite Member Modal */}`;

if (code.includes(checklistsEnd)) {
  code = code.replace(checklistsEnd, correctEnd);
  console.log("Added closing divs at the correct place.");
} else {
  console.log("Could not find Checklist end block!");
}

fs.writeFileSync('src/app/dashboard/settings/page.tsx', code, 'utf8');
