const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');

const lines = code.split('\n');

const modalStart = 757; // {showRateModal && (
const modalEnd = 813; //       )}

const rateModalLines = lines.slice(modalStart, modalEnd + 1);

// Now we need to splice out lines 757 to 820 inclusive!
// Wait, what is at 814 to 820?
// 814:     </>
// 815:                           ) : (
// 816:                             <button className="btn btn-primary btn-sm" style={{ flex: 1, background: int.color, borderColor: int.color }} onClick={() => openIntegrationConfig(int)}><Key size={13} /> Connect & Configure</button>
// 817:                           )}
// 818:                         </div>
// 819:                       </div>
// 820:     </>

// Let's verify what should be there. It should be:
//                             </>
//                           ) : (
//                             <button className="btn btn-primary btn-sm" style={{ flex: 1, background: int.color, borderColor: int.color }} onClick={() => openIntegrationConfig(int)}><Key size={13} /> Connect & Configure</button>
//                           )}
//                         </div>
//                       </div>

// So if I delete 757 to 820, I need to inject the proper end of the integrations mapping block at line 757.
const properIntegrationsEnd = \`                            </>
                          ) : (
                            <button className="btn btn-primary btn-sm" style={{ flex: 1, background: int.color, borderColor: int.color }} onClick={() => openIntegrationConfig(int)}><Key size={13} /> Connect & Configure</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      {activeTab === 'currency' && (\`;

// Let's find the exact block to replace!
const toReplace = code.substring(
  code.indexOf('{showRateModal && ('),
  code.indexOf('{activeTab === \\'currency\\' && (')
);

// We replace \`toReplace\` with \`properIntegrationsEnd\`
code = code.replace(toReplace, properIntegrationsEnd);

// Now we need to append \`rateModalLines\` to the end of the file, right before the final \`</>\`
const appendIdx = code.lastIndexOf('    </>');
code = code.substring(0, appendIdx) + '\\n      {/* Rate Modal */}\\n' + rateModalLines.join('\\n') + '\\n' + code.substring(appendIdx);

fs.writeFileSync('src/app/dashboard/settings/page.tsx', code, 'utf8');
console.log('Fixed the mangled file!');
