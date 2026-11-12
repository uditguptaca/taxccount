// The non-tax duties of Canada: company registry, employment, workplace safety, privacy and so on.
// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on 2026-11-11. Do not edit by hand:
// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.
import type { More } from '../more.ts';

export const more: More = {
 "version": "2026-11-11.97b35e01",
 "step": {
  "id": "ops",
  "title": "What else applies to you",
  "desc": "Tick what is true. Each tick can add a duty outside tax: documents to renew, staff, records, licences, registers.",
  "checklist": true
 },
 "departments": [
  {
   "id": "privacy",
   "name": "Privacy and anti-spam",
   "desc": "Reporting data breaches to the privacy regulator, keeping breach records, and the rules for commercial emails and texts."
  },
  {
   "id": "aml",
   "name": "Anti-money-laundering (FINTRAC)",
   "desc": "Reports and registration that certain business sectors owe to FINTRAC, Canada's financial intelligence unit."
  },
  {
   "id": "trade",
   "name": "Import, export and foreign investment",
   "desc": "The import-export account with the border agency and the notice a foreign investor files when starting or buying a Canadian business."
  },
  {
   "id": "reporting",
   "name": "Other mandatory reports",
   "desc": "Accessibility, supply-chain, environmental, statistical, pension-plan and unclaimed-property reports that the law requires from businesses that meet the test."
  },
  {
   "id": "labour",
   "name": "Employment and workplace safety",
   "desc": "Records of employment, pay and equity reports, mandatory policies, injury reporting and safety committees."
  },
  {
   "id": "personal",
   "name": "Personal documents and status",
   "desc": "Renewing your passport, permanent resident card, driver's licence, plates, health card and firearms licence, and reporting a move."
  },
  {
   "id": "ip",
   "name": "Patents, trademarks and designs",
   "desc": "Fees and renewals that keep a patent, a registered trademark or an industrial design in force (Canadian Intellectual Property Office)."
  }
 ],
 "questions": [
  {
   "id": "ca_x_fedreg",
   "step": "ops",
   "text": "Is your business in a federally regulated industry?",
   "type": "yn",
   "help": "Federally regulated workplaces follow the Canada Labour Code instead of provincial labour law. The government's list includes banks, air transportation, railways and road transport (trucks and buses) that cross provincial or international borders, marine shipping, ports and ferries, pipelines that cross borders, telecommunications, radio and television broadcasting, postal and courier services, grain elevators and feed mills, uranium mining and most federal Crown corporations. Most shops, restaurants, offices, builders and factories are provincially regulated: answer no.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "labour",
       "reporting"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_emp_band",
   "step": "ops",
   "text": "How many employees does the business have?",
   "type": "choice",
   "help": "Count everyone on the payroll, full-time, part-time and casual, each as one. Some rules count on their own day or place: Ontario's written-policy rules count employees in Ontario on January 1, British Columbia's pay transparency rule counts employees working in B.C. on January 1, and the federal rules use the average number of employees.",
   "options": [
    {
     "v": "e1",
     "label": "1 to 5"
    },
    {
     "v": "e6",
     "label": "6 to 9"
    },
    {
     "v": "e10",
     "label": "10 to 19"
    },
    {
     "v": "e20",
     "label": "20 to 24"
    },
    {
     "v": "e25",
     "label": "25 to 49"
    },
    {
     "v": "e50",
     "label": "50 to 99"
    },
    {
     "v": "e100",
     "label": "100 or more"
    }
   ],
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "labour",
       "reporting"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_private",
   "step": "ops",
   "text": "Is it a private company (its shares are not listed on a stock exchange and it is not a reporting issuer)?",
   "type": "yn",
   "help": "Private companies must keep a register of the people who own or control them. Public companies and their wholly-owned subsidiaries are excused.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "registry"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_solicit",
   "step": "ops",
   "text": "Did it receive more than $10,000 in public donations or government grants in a single financial year?",
   "type": "yn",
   "help": "A federal not-for-profit corporation that does is called a soliciting corporation and must send its financial statements to Corporations Canada every year.",
   "show": {
    "all": [
     {
      "kind": [
       "nonprofit"
      ]
     },
     {
      "dept": [
       "registry"
      ]
     },
     {
      "q": "ca_npo_corp",
      "yes": true
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_personal_info",
   "step": "ops",
   "text": "Does the business hold personal information about customers, clients or other people?",
   "type": "yn",
   "help": "Names with contact details, payment details, health or identity information and similar records about people. If such information is lost, stolen or seen by someone who should not see it, privacy law can require a report.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "privacy"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_cem",
   "step": "ops",
   "text": "Do you send emails, texts or other electronic messages to promote your business?",
   "type": "yn",
   "help": "Newsletters, offers and other commercial messages sent to customers or prospects. Canada's anti-spam law sets rules for consent, for what each message must contain and for unsubscribe requests.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "privacy"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_fintrac",
   "step": "ops",
   "text": "Is the business in one of the sectors that must report to FINTRAC?",
   "type": "yn",
   "help": "FINTRAC's list: accountants and accounting firms (when carrying out certain activities for clients), real estate brokers, sales representatives and developers, dealers in precious metals and precious stones, money services businesses, mortgage administrators, brokers and lenders, securities dealers, life insurance companies, brokers and agents, casinos, cheque cashers, armoured car businesses, factors, financing or leasing entities, title insurers, British Columbia notaries, and banks, credit unions, trust and loan companies.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "aml"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_msb",
   "step": "ops",
   "text": "Is it a money services business?",
   "type": "yn",
   "help": "Money services businesses must register with FINTRAC before they begin to operate and renew the registration every two years. If you are not sure whether your activities make you one, check FINTRAC's registration page.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust"
      ]
     },
     {
      "dept": [
       "aml"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_trade",
   "step": "ops",
   "text": "Does the business import or export commercial goods?",
   "type": "yn",
   "help": "Goods brought into or sent out of Canada for sale or business use. You need an import-export program account (RM) with the Canada Border Services Agency.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "trade"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_noncdn",
   "step": "ops",
   "text": "Is the business owned or controlled by non-Canadians, and has it just started a new business activity in Canada or bought control of a Canadian business?",
   "type": "yn",
   "help": "A foreign investor files a notification under the Investment Canada Act each time it starts a new business activity in Canada or acquires control of an existing Canadian business (unless the investment is large enough to need a full review).",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust"
      ]
     },
     {
      "dept": [
       "trade"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_trademark",
   "step": "ops",
   "text": "Do you or your business own a trademark registered in Canada?",
   "type": "yn",
   "help": "A registered trademark has to be renewed, for a fee, every 10 years.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "ip"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_supply",
   "step": "ops",
   "text": "Is it a large business that makes goods, or imports goods made outside Canada (or controls a business that does)?",
   "type": "yn",
   "help": "Large means it is listed on a Canadian stock exchange, or it has a place of business, does business or has assets in Canada and, in at least one of its last two financial years, met at least two of these three on its consolidated financial statements: $20 million or more in assets, $40 million or more in revenue, an average of 250 or more employees.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "reporting"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_fed_pension",
   "step": "ops",
   "text": "Does the business administer an employee pension plan registered with the federal regulator (OSFI)?",
   "type": "yn",
   "help": "Pension plans registered under the federal Pension Benefits Standards Act, 1985 are supervised by OSFI. Plans registered with a province follow that province's rules instead.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "reporting"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_npri",
   "step": "ops",
   "text": "Does a facility of yours meet the reporting criteria of the National Pollutant Release Inventory?",
   "type": "yn",
   "help": "Broadly: employees and contractors at the facility work more than 20,000 hours in the year (about 10 full-time workers) and the facility makes, processes, uses or releases a listed substance above its threshold (for most substances, 10 tonnes at a concentration of 1% or more). Some activities, such as running stationary combustion equipment above the air-release thresholds, count whatever the hours. Environment and Climate Change Canada publishes the full test.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "reporting"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_unclaimed",
   "step": "ops",
   "text": "Is the business holding money or other property that belongs to someone else and has gone unclaimed?",
   "type": "yn",
   "help": "Alberta calls a business that holds property for an owner a holder. Property left unclaimed for the period the law sets has to be reported and handed to the province.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "reporting"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_passport",
   "step": "ops",
   "text": "Do you hold a Canadian passport?",
   "type": "yn",
   "help": "An adult Canadian passport is valid for 5 or 10 years. The expiry date is on the photo page.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_pr",
   "step": "ops",
   "text": "Are you a permanent resident of Canada (not yet a citizen)?",
   "type": "yn",
   "help": "Permanent residents carry a PR card to show their status. Citizens answer no.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_pr_noaddr",
   "step": "ops",
   "text": "Did you become a permanent resident without giving IRCC a Canadian mailing address?",
   "type": "yn",
   "help": "IRCC mails the first PR card to a Canadian address. If you did not give one when you landed, you have to send it.",
   "show": {
    "all": [
     {
      "q": "ca_x_g_pr",
      "yes": true
     },
     {
      "dept": [
       "personal"
      ]
     },
     {
      "q": "ca_x_g_pr",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_g_dl",
   "step": "ops",
   "text": "Do you hold a driver's licence issued by your province?",
   "type": "yn",
   "help": "The licence card issued by the province where you live.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_vehicle",
   "step": "ops",
   "text": "Do you own a vehicle registered in your province?",
   "type": "yn",
   "help": "A car, light truck, motorcycle or moped with a licence plate in your name.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_health",
   "step": "ops",
   "text": "Do you have a provincial health card?",
   "type": "yn",
   "help": "For example the Ontario health card (OHIP) or the BC Services Card.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_moved",
   "step": "ops",
   "text": "Have you moved recently, or will you move soon?",
   "type": "yn",
   "help": "A change of home address has to be reported on some cards within a set number of days.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_pal",
   "step": "ops",
   "text": "Do you hold a firearms licence (PAL)?",
   "type": "yn",
   "help": "A Possession and Acquisition Licence issued under the Canadian Firearms Program.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_nexus",
   "step": "ops",
   "text": "Are you a NEXUS member?",
   "type": "yn",
   "help": "The Canada-US trusted traveller card.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "personal"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_imports",
   "step": "ops",
   "text": "Does the business import commercial goods into Canada?",
   "type": "yn",
   "help": "Goods brought in for sale or business use, cleared through the Canada Border Services Agency (often by a customs broker).",
   "show": {
    "all": [
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "dept": [
       "trade"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_g_exports",
   "step": "ops",
   "text": "Does the business export commercial goods worth CAD 2,000 or more per shipment, or any restricted (controlled) goods?",
   "type": "yn",
   "help": "Non-restricted commercial goods under CAD 2,000 do not need an export declaration. Restricted goods are those that need an export permit.",
   "show": {
    "all": [
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "dept": [
       "trade"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_g_srp",
   "step": "ops",
   "text": "Is the business approved for the CBSA Summary Reporting Program for its exports?",
   "type": "yn",
   "help": "Approved exporters of bulk or homogeneous goods may send one summary of each month's exports instead of a declaration per shipment.",
   "show": {
    "all": [
     {
      "q": "ca_x_g_exports",
      "yes": true
     },
     {
      "dept": [
       "trade"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_exports",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ca_x_g_patent",
   "step": "ops",
   "text": "Do you or your business own a Canadian patent, or have a patent application pending in Canada?",
   "type": "yn",
   "help": "Patents and pending applications are kept alive by a yearly maintenance fee to the Canadian Intellectual Property Office.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "ip"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_design",
   "step": "ops",
   "text": "Do you or your business own a registered industrial design in Canada?",
   "type": "yn",
   "help": "A registered design (the look of a product) needs one maintenance fee to stay protected beyond five years.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "ip"
      ]
     }
    ]
   }
  },
  {
   "id": "ca_x_g_fcp",
   "step": "ops",
   "text": "Does the business have 100 or more permanent employees in Canada and bid on Government of Canada goods or services contracts of $1 million or more?",
   "type": "yn",
   "help": "Such suppliers come under the Federal Contractors Program and must commit to employment equity before bidding.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     }
    ]
   }
  }
 ],
 "compliances": [
  {
   "id": "ca_x_isc_change",
   "name": "Keep the register of individuals with significant control up to date and file changes",
   "dept": "registry",
   "head": "Ownership register",
   "authority": "Corporations Canada",
   "brief": "A private federal corporation keeps a register of its individuals with significant control (the people who own or control it) and files that information with Corporations Canada. Changes have to be recorded and filed quickly, not only once a year.",
   "why": "It is a private corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "ca_federal",
      "yes": true
     },
     {
      "q": "ca_x_private",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of a change to the register"
   },
   "dueText": "Update the register at least once a year and within 15 days of becoming informed of any change. File the change with Corporations Canada within 15 days of recording it in the register. The information is also filed every year with the annual return, and within 30 days of the date on a certificate of amalgamation.",
   "weight": 78,
   "source": "ca_x_src_isc_file",
   "verified": true,
   "form": "ISC register and ISC filing (Online Filing Centre)",
   "penalty": "A Certificate of Compliance may be refused, the corporation may be administratively dissolved, and it may be found guilty of an offence and fined up to $100,000 on summary conviction.",
   "note": "The yearly filing with the annual return is already covered by the existing item ca_corpcan. Who must keep the register was read on the page 'Individuals with significant control' (modified 2026-03-30).",
   "roll": false
  },
  {
   "id": "ca_x_cbca_directors",
   "name": "Report a change of directors (federal corporation)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Corporations Canada",
   "brief": "When a director joins, leaves or changes address, a federal corporation tells Corporations Canada so the public record stays correct.",
   "why": "It is a corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of a change in the board of directors"
   },
   "dueText": "Within 15 days of new directors being elected or of individuals ceasing to be directors. A director's change of address: within 15 days of the corporation being informed of it.",
   "weight": 70,
   "source": "ca_x_src_cbca_next",
   "verified": true,
   "form": "Changes regarding directors (Online Filing Centre)",
   "note": "The page states no fine for this filing; it describes dissolution only for unfiled annual returns and ISC information.",
   "roll": false
  },
  {
   "id": "ca_x_cbca_office",
   "name": "Report a change of registered office address (federal corporation)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Corporations Canada",
   "brief": "A federal corporation that moves its registered office tells Corporations Canada.",
   "why": "It is a corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days following the change of address"
   },
   "dueText": "You must notify Corporations Canada of any change to the corporation's registered office address within 15 days following the change.",
   "weight": 68,
   "source": "ca_x_src_cbca_next",
   "verified": true,
   "form": "Change of registered office address (Online Filing Centre)",
   "roll": false
  },
  {
   "id": "ca_x_cbca_agm",
   "name": "Hold the annual shareholders' meeting (federal corporation)",
   "dept": "registry",
   "head": "Corporate governance",
   "authority": "Corporations Canada",
   "brief": "A federal corporation holds a shareholders' meeting every year. At a minimum the meeting considers the financial statements.",
   "why": "It is a corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 6
   },
   "dueText": "On a date that is no later than 15 months after holding the last preceding annual meeting, but no later than six months after the end of its preceding financial year. The directors must call the first shareholders' meeting within 18 months of the date of incorporation.",
   "weight": 66,
   "source": "ca_x_src_cbca_shares",
   "verified": true,
   "form": "Annual meeting of shareholders",
   "note": "The 18-month rule for the first meeting was read on 'Next steps following the incorporation of your business' (modified 2026-02-25). The page on shareholders was last modified 2023-05-10.",
   "roll": false
  },
  {
   "id": "ca_x_nfp_directors",
   "name": "Report a change of directors or registered office (federal not-for-profit)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Corporations Canada",
   "brief": "A federal not-for-profit corporation tells Corporations Canada when a director is appointed, elected, resigns, is removed or changes address, and when its registered office moves. Filing is free.",
   "why": "It is a not-for-profit corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "nonprofit"
      ]
     },
     {
      "q": "ca_npo_corp",
      "yes": true
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of a change regarding directors"
   },
   "dueText": "Changes regarding directors: within 15 days of the change or, in the case of a change to a director's address, within 15 days of being notified of the change. Change of registered office address: immediately (it takes effect only once Corporations Canada accepts it).",
   "weight": 68,
   "source": "ca_x_src_nfp",
   "verified": true,
   "form": "Changes regarding directors; change of registered office address (Online Filing Centre)",
   "penalty": "Any not-for-profit corporation that defaults for a period of one year in sending any fee, notice or document required by the NFP Act could be dissolved.",
   "note": "The page was last modified 2022-07-21.",
   "roll": false
  },
  {
   "id": "ca_x_nfp_bylaws",
   "name": "File new or changed by-laws (federal not-for-profit)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Corporations Canada",
   "brief": "A federal not-for-profit corporation sends Corporations Canada a copy of every new by-law, every change and every repeal. Filing is free.",
   "why": "It is a not-for-profit corporation incorporated federally.",
   "applies": {
    "all": [
     {
      "kind": [
       "nonprofit"
      ]
     },
     {
      "q": "ca_npo_corp",
      "yes": true
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 12 months of the members confirming the by-law"
   },
   "dueText": "Within 12 months of confirmation by members.",
   "weight": 45,
   "source": "ca_x_src_nfp",
   "verified": true,
   "form": "By-laws (Online Filing Centre)",
   "penalty": "Any not-for-profit corporation that defaults for a period of one year in sending any fee, notice or document required by the NFP Act could be dissolved.",
   "note": "The page was last modified 2022-07-21.",
   "roll": false
  },
  {
   "id": "ca_x_nfp_fs",
   "name": "File financial statements (federal soliciting not-for-profit)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Corporations Canada",
   "brief": "A federal not-for-profit corporation that receives more than $10,000 in public donations or government grants in a single financial year sends its financial statements to Corporations Canada every year. Filing is free.",
   "why": "It is a federal not-for-profit corporation that received more than $10,000 from public donations or government grants in one financial year.",
   "applies": {
    "all": [
     {
      "kind": [
       "nonprofit"
      ]
     },
     {
      "q": "ca_npo_corp",
      "yes": true
     },
     {
      "q": "ca_federal",
      "yes": true
     },
     {
      "q": "ca_x_solicit",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Not less than 21 days before each annual meeting of members"
   },
   "dueText": "Not less than 21 days before each annual meeting of members or as soon as possible after a written resolution is signed.",
   "weight": 62,
   "source": "ca_x_src_nfp",
   "verified": true,
   "form": "Financial statements (Online Filing Centre)",
   "penalty": "Any not-for-profit corporation that defaults for a period of one year in sending any fee, notice or document required by the NFP Act could be dissolved.",
   "note": "The page was last modified 2022-07-21.",
   "roll": false
  },
  {
   "id": "ca_x_roe",
   "name": "Record of Employment",
   "dept": "labour",
   "head": "Employment records",
   "authority": "Service Canada",
   "brief": "Each time an employee has an interruption of earnings (seven days in a row with no work and no insurable earnings), the employer issues a Record of Employment. It is the record used for the employee's Employment Insurance claim.",
   "why": "You pay employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 5 calendar days of the interruption of earnings (paper), or of the end of the pay period in which it happens (electronic)"
   },
   "dueText": "Paper ROE: within 5 calendar days of the first day of the interruption of earnings, or of the day you become aware of it. Electronic ROE with weekly, biweekly or semi-monthly pay: up to 5 calendar days after the end of the pay period in which the interruption occurs. Electronic ROE with monthly pay or 13 pay periods a year: the earlier of 5 calendar days after the end of that pay period and 15 calendar days after the first day of the interruption.",
   "weight": 86,
   "source": "ca_x_src_roe",
   "verified": true,
   "form": "ROE",
   "penalty": "The page states a consequence only for false reasons: if you knowingly enter a false or misleading reason for issuing an ROE, you may be subject to fines or prosecution.",
   "note": "Keep records of the serial numbers of all completed or destroyed ROEs for 6 years. The page does not state the penalty for a late ROE.",
   "roll": false
  },
  {
   "id": "ca_x_payequity",
   "name": "Pay equity annual statement (federally regulated employers)",
   "dept": "labour",
   "head": "Pay and equity reports",
   "authority": "Pay Equity Commissioner (Canadian Human Rights Commission)",
   "brief": "Federally regulated employers with 10 or more employees must have a pay equity plan and send the Pay Equity Commissioner a statement about it every year, even when the plan has not changed.",
   "why": "You are a federally regulated employer with 10 or more employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_fedreg",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e10",
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      6,
      30
     ]
    ]
   },
   "dueText": "Employers must submit an annual statement by June 30 each year, even if their pay equity plan hasn't changed. The first statement is due by June 30 of the calendar year after the employer posted its final pay equity plan.",
   "weight": 70,
   "source": "ca_x_src_payeq",
   "verified": true,
   "form": "Annual statement to the Pay Equity Commissioner",
   "penalty": "The page states no penalty for a late statement. Knowingly making a false or misleading statement is described as a very serious offence that could lead to an administrative monetary penalty.",
   "note": "The final pay equity plan itself is due three years after the employer becomes subject to the Act (September 3, 2024 for employers covered on August 31, 2021), and a revised plan is posted by the fifth anniversary of posting. The 10-employee threshold was read on 'Overview of the Pay Equity Act' (canada.ca, 2023-11-28).",
   "roll": false
  },
  {
   "id": "ca_x_ee",
   "name": "Employment equity annual report (federally regulated, 100 or more employees)",
   "dept": "labour",
   "head": "Pay and equity reports",
   "authority": "Employment and Social Development Canada (Labour Program)",
   "brief": "Federally regulated private-sector employers and Crown corporations with 100 or more employees send the Labour Program an employment equity report every year.",
   "why": "You are a federally regulated employer with 100 or more employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_fedreg",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e100"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      6,
      1
     ]
    ]
   },
   "dueText": "Every year by June 1, employers submit employment equity reports to the Labour Program.",
   "weight": 68,
   "source": "ca_x_src_ee",
   "verified": true,
   "form": "Employment equity report (Labour Program)",
   "note": "The page read is dated 2022-08-25 and does not state the penalty or the period the report covers.",
   "roll": false
  },
  {
   "id": "ca_x_eahor",
   "name": "Employer's Annual Hazardous Occurrence Report (federally regulated employers)",
   "dept": "labour",
   "head": "Yearly safety reports",
   "authority": "Employment and Social Development Canada (Labour Program)",
   "brief": "Employers under federal jurisdiction report to the Labour Program every year on the injuries and other hazardous occurrences in their workplaces during the previous calendar year.",
   "why": "You are a federally regulated employer with staff.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_fedreg",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      3,
      1
     ]
    ],
    "forYear": -1
   },
   "dueText": "Each year by March 1, for January 1 to December 31 of the previous year.",
   "weight": 66,
   "source": "ca_x_src_hs_who",
   "verified": true,
   "form": "EAHOR",
   "note": "The pages read do not state the penalty or say in so many words that a nil report is required. A third report, the Work Place Committee Report, is also due March 1; which employers must file it was not on the pages read.",
   "roll": false
  },
  {
   "id": "ca_x_eahvor",
   "name": "Employer's Annual Harassment and Violence Occurrence Report (federally regulated employers)",
   "dept": "labour",
   "head": "Yearly safety reports",
   "authority": "Employment and Social Development Canada (Labour Program)",
   "brief": "Employers under federal jurisdiction report to the Labour Program every year on the occurrences of workplace harassment and violence for which they received a notice during the previous calendar year.",
   "why": "You are a federally regulated employer with staff.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_fedreg",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      3,
      1
     ]
    ],
    "forYear": -1
   },
   "dueText": "All three reports (EAHOR, EAHVOR and the Work Place Committee Report) are due by March 1st of each year, for the previous calendar year.",
   "weight": 66,
   "source": "ca_x_src_hs_complete",
   "verified": true,
   "form": "EAHVOR",
   "note": "Who must submit was read on 'Employer's Annual Health and Safety Reports: Who must submit' (2025-12-30). The pages read do not state the penalty.",
   "roll": false
  },
  {
   "id": "ca_x_aca",
   "name": "Accessibility plan and progress reports (federally regulated, 10 or more employees)",
   "dept": "reporting",
   "head": "Accessibility",
   "authority": "Accessibility Commissioner",
   "brief": "Federally regulated businesses with 10 or more employees publish an accessibility plan, report on their progress in the years between plans, and tell the Accessibility Commissioner each time they publish.",
   "why": "You are a federally regulated business with 10 or more employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_fedreg",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e10",
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      6,
      1
     ]
    ]
   },
   "dueText": "First accessibility plans were due June 1, 2023 for businesses with 100 or more employees and June 1, 2024 for businesses with 10 to 99 employees. Publish progress reports by the first and second anniversary of that deadline, and update and publish the plan every 3 years. Tell the Accessibility Commissioner within 48 hours after publishing any of these documents.",
   "weight": 62,
   "source": "ca_x_src_aca",
   "verified": true,
   "form": "Accessibility plan, progress report and feedback process",
   "penalty": "The penalty amount for very serious violations could be as small as $6,250 and as big as $250,000.",
   "note": "Deadlines can differ for businesses that fall under the CRTC's or the Canadian Transportation Agency's accessibility rules. The summary page is dated 2023-06-16.",
   "roll": false
  },
  {
   "id": "ca_x_pipeda_breach",
   "name": "Report a privacy breach and keep breach records (PIPEDA)",
   "dept": "privacy",
   "head": "Privacy breaches",
   "authority": "Office of the Privacy Commissioner of Canada",
   "brief": "When personal information is lost, stolen or accessed without permission and this creates a real risk of significant harm to someone, the organization reports it to the Privacy Commissioner and tells the people affected. A record of every breach, serious or not, is kept for two years.",
   "why": "Your business holds personal information about people.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as feasible after you determine a breach creates a real risk of significant harm"
   },
   "dueText": "Notification to individuals must be given as soon as feasible after you have determined that a breach of security safeguards involving a real risk of significant harm has occurred, and the breach must be reported to the Privacy Commissioner. Keep records of all breaches of security safeguards for two years.",
   "weight": 80,
   "source": "ca_x_src_opc",
   "verified": true,
   "form": "Breach report to the Office of the Privacy Commissioner of Canada",
   "penalty": "It is an offence to knowingly contravene PIPEDA's reporting, notification and record-keeping requirements, and doing so could lead to fines. The Commissioner can refer possible offences to the Attorney General of Canada.",
   "note": "The page gives the 'as soon as feasible' timing for notifying individuals; it does not state a separate number of days for the report to the Commissioner, and it does not state the fine amount. Alberta, British Columbia and Québec have their own private-sector privacy laws for information handled within the province.",
   "roll": false
  },
  {
   "id": "ca_x_casl",
   "name": "Act on unsubscribe requests and identify yourself in commercial emails and texts (CASL)",
   "dept": "privacy",
   "head": "Anti-spam",
   "authority": "Canadian Radio-television and Telecommunications Commission (CRTC)",
   "brief": "A business that sends commercial emails or texts needs the recipient's consent, must say who it is and how to reach it, and must include a working way to unsubscribe.",
   "why": "You send commercial emails, texts or other electronic messages.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_cem",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 business days of each unsubscribe request"
   },
   "dueText": "Every unsubscribe request must be actioned within 10 business days or less and at no cost to the recipient. The contact information in each message must be valid for at least 60 days after you send it. Implied consent may be valid for up to 2 years, or just 6 months in the case of inquiries or applications.",
   "weight": 60,
   "source": "ca_x_src_casl",
   "verified": true,
   "form": "Canada's anti-spam legislation requirements",
   "note": "The CRTC's own pages (crtc.gc.ca) refused automated access, so the penalty amounts were not read and are left out. The ISED page read is dated 2019-04-01.",
   "roll": false
  },
  {
   "id": "ca_x_fintrac_lctr",
   "name": "Large Cash Transaction Report",
   "dept": "aml",
   "head": "FINTRAC reports",
   "authority": "FINTRAC",
   "brief": "A business in a FINTRAC-regulated sector reports every time it receives $10,000 or more in cash in a single transaction, or in linked amounts within 24 hours.",
   "why": "Your business is in a sector that must report to FINTRAC.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "any": [
       {
        "q": "ca_x_fintrac",
        "yes": true
       },
       {
        "q": "ca_x_msb",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 calendar days after the day you receive the cash"
   },
   "dueText": "Within 15 calendar days after the day on which you receive the cash. A report is required when you receive $10,000 or more in cash in a single transaction, or 2 or more amounts in cash that total $10,000 or more within a consecutive 24-hour window.",
   "weight": 75,
   "source": "ca_x_src_lctr",
   "verified": true,
   "form": "LCTR",
   "penalty": "Failure to provide applicable reporting information will result in non-compliance and may lead to criminal or administrative penalties.",
   "note": "Accountants, real estate businesses and British Columbia notaries are covered only when carrying out certain activities for clients; FINTRAC's sector pages set these out.",
   "roll": false
  },
  {
   "id": "ca_x_fintrac_str",
   "name": "Suspicious Transaction Report",
   "dept": "aml",
   "head": "FINTRAC reports",
   "authority": "FINTRAC",
   "brief": "A business in a FINTRAC-regulated sector, and its employees, must report suspicious transactions to FINTRAC.",
   "why": "Your business is in a sector that must report to FINTRAC.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "any": [
       {
        "q": "ca_x_fintrac",
        "yes": true
       },
       {
        "q": "ca_x_msb",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as practicable after you have completed the measures that support your suspicion"
   },
   "dueText": "You must submit the Suspicious Transaction Report to FINTRAC as soon as practicable after you have completed measures (the page's sentence continues with what those measures are). There is no fixed number of days.",
   "weight": 74,
   "source": "ca_x_src_str",
   "verified": true,
   "form": "STR",
   "note": "The page is very long and only its first part was read. What makes a transaction suspicious, and the measures the deadline is counted from, are set out there.",
   "roll": false
  },
  {
   "id": "ca_x_fintrac_review",
   "name": "Review your anti-money-laundering compliance program",
   "dept": "aml",
   "head": "FINTRAC compliance program",
   "authority": "FINTRAC",
   "brief": "Every business in a FINTRAC-regulated sector must have a compliance program with a named compliance officer, and must test how well the program works at least every two years.",
   "why": "Your business is in a sector that must report to FINTRAC.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "any": [
       {
        "q": "ca_x_fintrac",
        "yes": true
       },
       {
        "q": "ca_x_msb",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "At least every two years; report the results to a senior officer within 30 days"
   },
   "dueText": "Carry out this review every two years at a minimum. If you are an entity, report the results in writing to a senior officer no later than 30 days after the completion of the effectiveness review.",
   "weight": 66,
   "source": "ca_x_src_fintrac_cp",
   "verified": true,
   "form": "Two-year effectiveness review",
   "penalty": "FINTRAC may issue administrative monetary penalties (civil penalties) to reporting entities for non-compliance. The amounts are on a separate page that was not read.",
   "roll": false
  },
  {
   "id": "ca_x_fintrac_msb",
   "name": "Money services business registration: renew and keep up to date",
   "dept": "aml",
   "head": "FINTRAC registration",
   "authority": "FINTRAC",
   "brief": "A money services business registers with FINTRAC before it begins to operate, renews the registration every two years and reports changes to its details.",
   "why": "It is a money services business.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust"
      ]
     },
     {
      "q": "ca_x_msb",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Renew before the registration expires (every two years); report changes within 30 days"
   },
   "dueText": "Your registration is valid for two years. You must renew your registration before its expiry date. If registration information changes you must inform FINTRAC within 30 days, and you have 30 days to respond to a clarification request.",
   "weight": 80,
   "source": "ca_x_src_msb",
   "verified": true,
   "form": "MSB registration with FINTRAC",
   "penalty": "Failure to register may result in administrative monetary penalties or criminal charges. Failure to respond to a clarification request on time may result in the same, and FINTRAC can deny or revoke the registration.",
   "roll": false
  },
  {
   "id": "ca_x_fintrac_eft",
   "name": "Electronic Funds Transfer Report (money services businesses)",
   "dept": "aml",
   "head": "FINTRAC reports",
   "authority": "FINTRAC",
   "brief": "A money services business reports each international electronic funds transfer of $10,000 or more.",
   "why": "It is a money services business.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust"
      ]
     },
     {
      "q": "ca_x_msb",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 5 business days of the transfer"
   },
   "dueText": "You must submit an Electronic Funds Transfer Report to FINTRAC within 5 business days. It covers an international electronic funds transfer of $10,000 or more in a single transaction.",
   "weight": 70,
   "source": "ca_x_src_eft",
   "verified": true,
   "form": "EFTR",
   "note": "Only the first part of this long page was read: the day from which the 5 business days are counted, and the 24-hour rule for linked transfers, should be confirmed there. Banks, credit unions and casinos owe the same report but are outside this checker's entity types.",
   "roll": false
  },
  {
   "id": "ca_x_rm_account",
   "name": "Import-export program account (RM) with the border agency",
   "dept": "trade",
   "head": "Import and export registration",
   "authority": "Canada Border Services Agency",
   "brief": "A business that imports or exports commercial goods needs an import-export program (RM) account on its business number. New importers and exporters register for it in the CARM Client Portal of the Canada Border Services Agency.",
   "why": "You import or export commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Before your first import or export, well in advance"
   },
   "dueText": "Ensure you have registered for an RM account well in advance of your import or export deadlines.",
   "weight": 72,
   "source": "ca_x_src_rm",
   "verified": true,
   "form": "RM account, registered in the CARM Client Portal",
   "penalty": "No penalty is stated. The page says registering early helps avoid delays in the release of your goods.",
   "note": "Not read on an official page and therefore left out: the due dates for paying duties and taxes on statements of account, the deadline for the commercial accounting declaration, and the financial security rules for release prior to payment.",
   "roll": false
  },
  {
   "id": "ca_x_ica_notice",
   "name": "Investment Canada Act notification (foreign investors)",
   "dept": "trade",
   "head": "Foreign investment",
   "authority": "Innovation, Science and Economic Development Canada (Investment Review)",
   "brief": "A non-Canadian files a notification each time it starts a new business activity in Canada or acquires control of an existing Canadian business, unless the investment is one that needs a full review.",
   "why": "The business is owned or controlled by non-Canadians and has started a new business activity in Canada or bought control of a Canadian business.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust"
      ]
     },
     {
      "q": "ca_x_noncdn",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "No later than 30 days after the investment is implemented"
   },
   "dueText": "A Notification must be filed no later than thirty days after the implementation of the investment.",
   "weight": 55,
   "source": "ca_x_src_ica",
   "verified": true,
   "form": "Notification – establishment of a new business or acquisition of control",
   "note": "The page read is dated 2023-09-28. It does not state a penalty for failing to notify.",
   "roll": false
  },
  {
   "id": "ca_x_tm_renew",
   "name": "Renew a registered trademark",
   "dept": "ip",
   "head": "Renewals",
   "authority": "Canadian Intellectual Property Office",
   "brief": "A trademark registration is renewed for 10 years at a time by paying a renewal fee, which depends on the number of classes of goods or services.",
   "why": "You or your business own a trademark registered in Canada.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trademark",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "From 6 months before to 6 months after the registration expires"
   },
   "dueText": "A renewal fee must be submitted no earlier than 6 months before the expiry of the initial period or renewal period and no later than 6 months after it or, if later, two months after a renewal notice.",
   "weight": 40,
   "source": "ca_x_src_tm",
   "verified": true,
   "form": "Trademark renewal (Canadian Intellectual Property Office)",
   "note": "The practice notice read is dated 2020-10-27. It does not set out in general terms what happens when a registration is not renewed, so no consequence is given here.",
   "roll": false
  },
  {
   "id": "ca_x_supply_chain",
   "name": "Forced labour and child labour in supply chains: annual report",
   "dept": "reporting",
   "head": "Supply chain",
   "authority": "Public Safety Canada",
   "brief": "Large businesses that make goods, import goods made outside Canada, or control a business that does, submit a report every year under the Fighting Against Forced Labour and Child Labour in Supply Chains Act and publish it on their website.",
   "why": "It is a large business that produces or imports goods, or controls one that does.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_supply",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      5,
      31
     ]
    ]
   },
   "dueText": "A report must be submitted to the Minister of Public Safety by May 31 of each year, covering the entity's previous financial year, and published in a prominent location on the entity's website.",
   "weight": 60,
   "source": "ca_x_src_supply",
   "verified": true,
   "form": "Report to the Minister of Public Safety (online questionnaire and report)",
   "note": "The pages read do not state the fine for failing to report. The report must be approved by the entity's governing body and carry an attestation.",
   "roll": false
  },
  {
   "id": "ca_x_statcan",
   "name": "Answer mandatory Statistics Canada business surveys",
   "dept": "reporting",
   "head": "Statistical surveys",
   "authority": "Statistics Canada",
   "brief": "When Statistics Canada selects a business for one of its business surveys, taking part is in most cases a legal duty, not a choice.",
   "why": "You run a business that Statistics Canada may select for a survey.",
   "applies": {
    "kind": [
     "sole_prop",
     "partnership",
     "corporation",
     "trust",
     "nonprofit"
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "By the date given on the survey you receive"
   },
   "dueText": "Participation in most business and agricultural surveys is mandatory. The date to reply by is given with each survey.",
   "weight": 35,
   "source": "ca_x_src_statcan",
   "verified": false,
   "form": "Statistics Canada business survey questionnaire",
   "note": "NOT CONFIRMED: the page read states that participation is mandatory but gives no reply deadline and no penalty. Statistics Canada's business survey pages (statcan.gc.ca/en/survey/business and /mandatory) returned HTTP 503 on 2026-11-11, so the wording that the reply date is on each survey is an assumption, not a quotation.",
   "roll": false
  },
  {
   "id": "ca_x_osfi49",
   "name": "Pension plan annual information return (federally registered plans)",
   "dept": "reporting",
   "head": "Pension plans",
   "authority": "Office of the Superintendent of Financial Institutions",
   "brief": "The administrator of a pension plan registered under the federal Pension Benefits Standards Act, 1985 files a yearly information return and certification with OSFI, through its Regulatory Reporting System.",
   "why": "The business administers a pension plan registered with OSFI.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_fed_pension",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Within six months after the end of the plan year"
   },
   "dueText": "The returns must be filed within six months after the end of the plan year to which they relate.",
   "weight": 55,
   "source": "ca_x_src_osfi49",
   "verified": true,
   "form": "OSFI 49, OSFI 49A and the Pension Plan Annual Corporate Certification",
   "penalty": "Plans may be subject to CRA late filing penalties if the filing process is incomplete, because the information reaches the Canada Revenue Agency only after the returns are accepted.",
   "note": "The plan year may differ from the business's financial year, so no date is worked out. Plans registered with a province (for example with Ontario's FSRA, whose site refused automated access) have their own return and deadline, not covered here.",
   "roll": false
  },
  {
   "id": "ca_x_npri",
   "name": "National Pollutant Release Inventory report",
   "dept": "reporting",
   "head": "Environment",
   "authority": "Environment and Climate Change Canada",
   "brief": "Facilities that meet the size and substance tests report to the National Pollutant Release Inventory every year. Reporting is mandatory under the Canadian Environmental Protection Act, 1999.",
   "why": "One of your facilities meets the inventory's reporting criteria.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_npri",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      6,
      1
     ]
    ],
    "forYear": -1
   },
   "dueText": "Reports are due every year by June 1, for the previous calendar year (2026 calendar year: the deadline is June 1, 2027).",
   "weight": 45,
   "source": "ca_x_src_npri",
   "verified": true,
   "form": "NPRI report (ECCC Single Window)",
   "note": "The pages read do not state the penalty. The year-by-year deadlines were read on 'Deadlines and changes: reporting guide for the National Pollutant Release Inventory' (2025-07-22).",
   "roll": false
  },
  {
   "id": "ca_x_on_aoda",
   "name": "Ontario accessibility compliance report",
   "dept": "reporting",
   "head": "Accessibility",
   "authority": "Government of Ontario",
   "brief": "Ontario businesses and non-profit organizations with 20 or more employees file an accessibility compliance report every three years.",
   "why": "You have 20 or more employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "on",
    "dates": [
     "2026-12-31"
    ]
   },
   "dueText": "You must file an accessibility compliance report every three years. The reporting deadline is December 31, 2026.",
   "weight": 78,
   "source": "ca_x_src_on_aoda",
   "verified": true,
   "form": "Accessibility compliance report (AODA)",
   "penalty": "If you do not file, you could face enforcement measures which can include financial penalties.",
   "note": "The three-year cycle cannot be written as a yearly rule: only the 2026 date read on the page is given. After it, the next report follows three years later; confirm the date on the page. The page does not say how employees are counted.",
   "roll": false
  },
  {
   "id": "ca_x_on_poster",
   "name": "Give each new employee Ontario's employment standards poster",
   "dept": "labour",
   "head": "Mandatory posters",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "Ontario employers give every employee a copy of the official employment standards poster. Workplaces also post the Health & Safety at Work poster, a copy of the Occupational Health and Safety Act and the WSIB 'In case of injury' poster (Form 82).",
   "why": "You pay employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days of each employee's date of hire"
   },
   "dueText": "The poster must be provided to employees who are covered by the ESA within 30 days of their date of hire.",
   "weight": 58,
   "source": "ca_x_src_on_posters",
   "verified": true,
   "form": "Employment standards poster",
   "note": "Federally regulated employers follow the Canada Labour Code instead.",
   "roll": false
  },
  {
   "id": "ca_x_on_disconnect",
   "name": "Ontario written policy on disconnecting from work",
   "dept": "labour",
   "head": "Written workplace policies",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "Ontario employers with 25 or more employees on January 1 must have a written policy on disconnecting from work and give every employee a copy.",
   "why": "You have 25 or more employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e25",
       "e50",
       "e100"
      ]
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      2,
      28
     ]
    ]
   },
   "dueText": "The policy must be in place before March 1 of that year. A copy must be provided to employees within 30 calendar days of the policy being prepared or changed. Keep each policy for three years after it is no longer in effect.",
   "weight": 60,
   "source": "ca_x_src_on_disconnect",
   "verified": true,
   "form": "Written policy",
   "note": "The date shown is February 28: the policy has to exist before March 1, so the last day of February is the last day to have it in place (February 29 in a leap year).",
   "roll": false
  },
  {
   "id": "ca_x_on_emon",
   "name": "Ontario written policy on electronic monitoring of employees",
   "dept": "labour",
   "head": "Written workplace policies",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "Ontario employers with 25 or more employees on January 1 must have a written policy saying whether and how they electronically monitor employees, and give every employee a copy.",
   "why": "You have 25 or more employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e25",
       "e50",
       "e100"
      ]
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      2,
      28
     ]
    ]
   },
   "dueText": "The policy must be in place before March 1 of that year. A copy must be provided to employees within 30 calendar days. Keep every policy for three years after it is no longer in effect.",
   "weight": 58,
   "source": "ca_x_src_on_emon",
   "verified": true,
   "form": "Written policy",
   "note": "The date shown is February 28: the policy has to exist before March 1, so the last day of February is the last day to have it in place (February 29 in a leap year).",
   "roll": false
  },
  {
   "id": "ca_x_on_form7",
   "name": "Report a workplace injury or illness to the WSIB (Ontario)",
   "dept": "labour",
   "head": "Injury reporting",
   "authority": "Workplace Safety and Insurance Board",
   "brief": "An Ontario employer reports a work injury or illness to the WSIB when the employee needs treatment from a health professional beyond first aid, cannot go to work, is paid less or works fewer hours, or needs modified work at regular pay for more than seven calendar days. The employee gets a copy.",
   "why": "You pay employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within three business days of learning about the injury or illness"
   },
   "dueText": "You must report a workplace injury or illness within three business days of learning about it. The WSIB must receive the Employer's report of injury (Form 7) within three business days.",
   "weight": 84,
   "source": "ca_x_src_on_form7",
   "verified": true,
   "form": "Employer's report of injury (Form 7)",
   "penalty": "You could face a financial penalty as well as prosecution for not reporting or reporting late.",
   "note": "No report is needed when first aid was enough, no time was lost and pay did not change (and any modified work lasted seven days or less).",
   "roll": false
  },
  {
   "id": "ca_x_on_critical",
   "name": "Notify Ontario's ministry of a workplace death, critical injury or occupational illness",
   "dept": "labour",
   "head": "Serious incidents",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "When someone is killed or critically injured at an Ontario workplace, the employer tells the ministry, the joint health and safety committee or representative and the union at once, then follows up in writing. Other accidents and occupational illnesses have a four-day written notice.",
   "why": "You pay employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Immediately, then a written report within 48 hours"
   },
   "dueText": "Fatality or critical injury: immediately notify the ministry's Health and Safety Contact Centre, the joint health and safety committee or representative and the union, and provide a written report within 48 hours. Other accidents, explosions, fires or workplace violence: written notice within four days of the incident to the committee or representative and the union (to the ministry only if an inspector requires it). Occupational illness: written notice to the ministry within four days of being advised.",
   "weight": 80,
   "source": "ca_x_src_on_incidents",
   "verified": true,
   "form": "Notice and written report under the Occupational Health and Safety Act",
   "note": "The page does not state the penalty.",
   "roll": false
  },
  {
   "id": "ca_x_on_jhsc",
   "name": "Ontario joint health and safety committee: meetings and inspections",
   "dept": "labour",
   "head": "Safety committees",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "An Ontario workplace that regularly employs 20 or more workers must have a joint health and safety committee. It meets and inspects the workplace on a fixed cycle, and its certified members refresh their training every three years.",
   "why": "You regularly employ 20 or more workers in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "event",
    "text": "Meet at least once every three months; inspect the workplace at least once a month"
   },
   "dueText": "Committee members are required to meet at least once every three months. The workplace must be inspected at least once a month. Certified members complete refresher training every 3 years.",
   "weight": 64,
   "source": "ca_x_src_on_jhsc",
   "verified": true,
   "form": "Joint health and safety committee",
   "note": "The page does not state the penalty. Names and work locations of committee members must be posted in the workplace.",
   "roll": false
  },
  {
   "id": "ca_x_on_policy_review",
   "name": "Review Ontario health and safety, workplace violence and harassment policies every year",
   "dept": "labour",
   "head": "Written workplace policies",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "Ontario workplaces with more than 5 regularly employed workers must post their health and safety policy and their workplace violence and workplace harassment policies, and review them at least once a year.",
   "why": "You regularly employ more than 5 workers in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e6",
       "e10",
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "At least once a year"
   },
   "dueText": "These policies must be reviewed at least once a year.",
   "weight": 55,
   "source": "ca_x_src_on_posters",
   "verified": true,
   "form": "Written policies under the Occupational Health and Safety Act",
   "note": "Read on Ontario's page 'Posters required in the workplace'. Smaller workplaces still need the policies; the page ties the posting duty to more than 5 workers.",
   "roll": false
  },
  {
   "id": "ca_x_on_supervisor",
   "name": "Ontario health and safety awareness training for new supervisors and workers",
   "dept": "labour",
   "head": "Mandatory training",
   "authority": "Government of Ontario (ministry responsible for labour)",
   "brief": "Ontario employers make sure every worker and every supervisor completes a basic health and safety awareness program, and keep a record of it. Owners who supervise workers count as supervisors.",
   "why": "You pay employees in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Supervisors: within one week of starting to supervise. Workers: as soon as practicable"
   },
   "dueText": "Employers must ensure supervisors complete an awareness training program for supervisors within one week of performing work as a supervisor. Employers must ensure workers complete an awareness training program for workers as soon as practicable.",
   "weight": 62,
   "source": "ca_x_src_on_sup",
   "verified": true,
   "form": "Basic occupational health and safety awareness training",
   "note": "The worker rule was read on the companion page 'Worker awareness training program' (updated 2024-04-11).",
   "roll": false
  },
  {
   "id": "ca_x_on_initial",
   "name": "Ontario initial return for a new corporation",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Ontario Business Registry (ServiceOntario)",
   "brief": "A new Ontario corporation files an initial return listing its directors, its five most senior officers and its registered office address. There is no government fee when filed online with ServiceOntario.",
   "why": "It is a corporation in Ontario that was not incorporated federally.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "any": [
       {
        "kind": [
         "corporation"
        ]
       },
       {
        "all": [
         {
          "kind": [
           "nonprofit"
          ]
         },
         {
          "q": "ca_npo_corp",
          "yes": true
         }
        ]
       }
      ]
     },
     {
      "not": {
       "q": "ca_federal",
       "yes": true
      }
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 60 days after incorporation, amalgamation or continuation",
    "from": "ca_inc_date"
   },
   "dueText": "Within 60 days after the date of incorporation, amalgamation or continuation of the corporation.",
   "weight": 72,
   "source": "ca_x_src_on_cia",
   "verified": true,
   "form": "Initial Return (Corporations Information Act)",
   "penalty": "Sections 13 and 14 of the Corporations Information Act provide penalties. A corporation in default that has unpaid fines or penalties cannot maintain a proceeding in an Ontario court in respect of its business.",
   "note": "Federal and other out-of-province corporations operating in Ontario file their own initial return, shown as a separate item (within 60 days after beginning to carry on business in Ontario).",
   "roll": false
  },
  {
   "id": "ca_x_on_ep_initial",
   "name": "Ontario initial return for a federal corporation",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Ontario Business Registry (ServiceOntario)",
   "brief": "A corporation incorporated outside Ontario, a federal corporation included, that carries on business in Ontario files an Initial Return under Ontario's Corporations Information Act with the Ontario Business Registry. It has no fee. Changes are then reported by a Notice of Change.",
   "why": "It is a federal corporation in Ontario.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "any": [
       {
        "kind": [
         "corporation"
        ]
       },
       {
        "all": [
         {
          "kind": [
           "nonprofit"
          ]
         },
         {
          "q": "ca_npo_corp",
          "yes": true
         }
        ]
       }
      ]
     },
     {
      "q": "ca_federal",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 60 days after the corporation begins to carry on business in Ontario"
   },
   "dueText": "Within 60 days after the date the corporation begins to carry on business in Ontario.",
   "weight": 72,
   "source": "ca_x_src_on_cia_ep",
   "verified": true,
   "form": "Initial Return (extra-provincial corporation)",
   "penalty": "Sections 13 and 14 of the Corporations Information Act provide penalties. A corporation in default that has unpaid fines or penalties cannot maintain a proceeding in an Ontario court in respect of its business.",
   "note": "Read in Ontario's notice for extra-provincial corporations, effective October 19, 2021. Ontario's yearly return is not asked of federal corporations: its notice lists Ontario corporations and licensed foreign corporations only.",
   "roll": false
  },
  {
   "id": "ca_x_on_change",
   "name": "Ontario notice of change (directors, officers, address)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Ontario Business Registry (ServiceOntario)",
   "brief": "An Ontario corporation reports every change to the information it has filed, such as its registered office address, its directors or its five most senior officers.",
   "why": "It is a corporation in Ontario, wherever it was incorporated.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "any": [
       {
        "kind": [
         "corporation"
        ]
       },
       {
        "all": [
         {
          "kind": [
           "nonprofit"
          ]
         },
         {
          "q": "ca_npo_corp",
          "yes": true
         }
        ]
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days after the change takes place"
   },
   "dueText": "Corporations must file a Notice of Change for every change in the information filed, within 15 days after the day the change takes place.",
   "weight": 72,
   "source": "ca_x_src_on_cia",
   "verified": true,
   "form": "Notice of Change (Corporations Information Act)",
   "penalty": "Sections 13 and 14 of the Corporations Information Act provide penalties. A corporation in default that has unpaid fines or penalties cannot maintain a proceeding in an Ontario court in respect of its business.",
   "note": "Ontario's Business Registry page (updated 2026-09-28) says the same of every registered entity: 'If your entity's information has changed, you must tell the ministry within 15 days.' Limited partnerships file a declaration of change and business-name holders an amended registration. Federal and other out-of-province corporations are covered too: the notice for extra-provincial corporations (effective October 19, 2021) says 'CIA filing requirements apply to all corporations with or without share capital wherever or however incorporated and includes an extra-provincial corporation' and gives the same 15 days.",
   "roll": false
  },
  {
   "id": "ca_x_on_isc",
   "name": "Ontario register of individuals with significant control",
   "dept": "registry",
   "head": "Ownership register",
   "authority": "Government of Ontario",
   "brief": "Privately held Ontario corporations keep a record of the individuals who own or control them at the registered office. It is not sent to a registry, but must be shown to law enforcement, tax and certain regulatory authorities on request.",
   "why": "It is a private corporation in Ontario that was not incorporated federally.",
   "applies": {
    "all": [
     {
      "state": [
       "ON"
      ]
     },
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "not": {
       "q": "ca_federal",
       "yes": true
      }
     },
     {
      "q": "ca_x_private",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Update at least once a year, and within 15 days of learning of a change"
   },
   "dueText": "Records must be updated at least once a year, and within 15 days of the corporation becoming aware of a change. The requirement took effect January 1, 2023.",
   "weight": 62,
   "source": "ca_x_src_on_isc",
   "verified": true,
   "form": "Register kept at the registered office (not filed)",
   "note": "The page is dated 2022-12-23 and does not state the fines.",
   "roll": false
  },
  {
   "id": "ca_x_qc_current",
   "name": "Québec current updating declaration (changes during the year)",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Registraire des entreprises du Québec",
   "brief": "A business registered in Québec's enterprise register reports any change to its file during the year, for example a new address or a change of directors. Filing is free.",
   "why": "The business is registered in Québec's enterprise register.",
   "applies": {
    "all": [
     {
      "state": [
       "QC"
      ]
     },
     {
      "any": [
       {
        "kind": [
         "corporation"
        ]
       },
       {
        "all": [
         {
          "kind": [
           "nonprofit"
          ]
         },
         {
          "q": "ca_npo_corp",
          "yes": true
         }
        ]
       },
       {
        "all": [
         {
          "kind": [
           "sole_prop",
           "partnership"
          ]
         },
         {
          "q": "ca_bizname",
          "yes": true
         }
        ]
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days following any change"
   },
   "dueText": "Enterprises have 30 days following any change to file a current updating declaration.",
   "weight": 70,
   "source": "ca_x_src_qc_obl",
   "verified": true,
   "form": "Déclaration de mise à jour courante (enterprise register)",
   "note": "Sanctions are on a separate page ('Civil and Penal Sanctions Stemming from Registration') that was not read. Information on ultimate beneficiaries (the people who own or control the business) is declared in the same declarations since March 31, 2023; that the 30-day rule covers a change of ultimate beneficiary was seen only in a search summary.",
   "roll": false
  },
  {
   "id": "ca_x_qc_oqlf",
   "name": "Register with the Office québécois de la langue française (25 or more employees)",
   "dept": "labour",
   "head": "French language",
   "authority": "Office québécois de la langue française",
   "brief": "A business that employs 25 or more people in Québec for six months registers with the Office québécois de la langue française and then reports on how French is used in the business. If French is not in general use, the Office asks for a francization program.",
   "why": "You employ 25 or more people in Québec.",
   "applies": {
    "all": [
     {
      "state": [
       "QC"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 6 months after the end of the 6-month period with 25 or more employees"
   },
   "dueText": "Register with the Office within the 6 months following the end of that period. Within three months of the date the registration certificate is issued, send the Office an analysis of the use of French in the business. If a francization program is requested, submit it within three months, then report on it every 12 months.",
   "weight": 68,
   "source": "ca_x_src_qc_lang",
   "verified": true,
   "form": "Inscription à l'Office (Portail OQLF)",
   "note": "The steps after registration were read on the OQLF page 'Entreprises' (updated 2026-10-23). Neither page states the fines. Businesses with 25 or more employees must show proof of compliance to obtain public contracts or subsidies. In a business with 100 or more employees the francization committee prepares the program.",
   "roll": false
  },
  {
   "id": "ca_x_qc_cai",
   "name": "Report a confidentiality incident and keep an incident register (Québec)",
   "dept": "privacy",
   "head": "Privacy breaches",
   "authority": "Commission d'accès à l'information du Québec",
   "brief": "When personal information held by a Québec business is accessed, used, disclosed or lost without authorization and there is a risk of serious harm, the business promptly notifies the Commission in writing. Every incident, serious or not, is entered in a register.",
   "why": "Your business holds personal information about people and operates in Québec.",
   "applies": {
    "all": [
     {
      "state": [
       "QC"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Promptly after an incident that presents a risk of serious harm"
   },
   "dueText": "When an incident presents a risk of serious harm, the enterprise must promptly notify the Commission in writing (« l'entreprise doit s'empresser d'en aviser la Commission »). The information in the register must be kept up to date and kept for a minimum of five years.",
   "weight": 76,
   "source": "ca_x_src_qc_cai",
   "verified": true,
   "form": "Avis à la Commission d'accès à l'information",
   "penalty": "The page describes no fine. The Commission may order the enterprise to notify the people concerned.",
   "note": "The people concerned must also be told. No number of days is given: the law's word is prompt. The first sentence of 'brief' describes an incident in general terms and is not a quotation.",
   "roll": false
  },
  {
   "id": "ca_x_qc_demes",
   "name": "Québec pay equity declaration (DEMES)",
   "dept": "labour",
   "head": "Pay and equity reports",
   "authority": "CNESST",
   "brief": "Québec employers covered by the Pay Equity Act declare each year to the CNESST where they stand with their pay equity work.",
   "why": "You have 10 or more employees in Québec.",
   "applies": {
    "all": [
     {
      "state": [
       "QC"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e10",
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year: the period could not be confirmed (reported as within 6 months after the end of the financial year)",
    "within": null
   },
   "dueText": "Reported, not confirmed: private employers file the declaration within 6 months after the end of their financial year, in the same period as the annual updating declaration to the enterprise register.",
   "weight": 60,
   "source": "ca_x_src_qc_demes",
   "verified": false,
   "form": "Déclaration de l'employeur en matière d'équité salariale",
   "note": "NOT CONFIRMED, so no date is worked out. The CNESST site refused automated access (HTTP 403) again on 2026-11-12, so the threshold, the deadline and the fines were seen only in a search engine's summary of CNESST pages. Confirm on cnesst.gouv.qc.ca before use.",
   "roll": false
  },
  {
   "id": "ca_x_bc_transparency",
   "name": "British Columbia transparency register: yearly review and updates",
   "dept": "registry",
   "head": "Ownership register",
   "authority": "BC Registries and Online Services",
   "brief": "A private company incorporated in British Columbia keeps a register of its significant individuals (the people who own or control it) at its records office, confirms it once a year and updates it when it learns something new.",
   "why": "It is a private company incorporated in British Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "BC"
      ]
     },
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "not": {
       "q": "ca_federal",
       "yes": true
      }
     },
     {
      "q": "ca_x_private",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "anniversary",
    "of": "ca_inc_date",
    "months": 2
   },
   "dueText": "Every year, within the period starting on the anniversary of the date on which the company was recognized and ending 2 months after that date, take reasonable steps to confirm the register is accurate, complete and up to date. New information must be recorded within 30 days after the company becomes aware of it.",
   "weight": 64,
   "source": "ca_x_src_bc_tr",
   "verified": true,
   "form": "Transparency register (kept at the records office, not filed)",
   "note": "Read in the Business Corporations Act (BC Laws, current to November 3, 2026) and on the province's 'Transparency Register' page (last updated 2022-09-01). The part read has no requirement to file the register with the government and no fine amounts; a 2023 bill proposed both a filing duty and a shorter update period, and whether it is in force was not confirmed.",
   "roll": false
  },
  {
   "id": "ca_x_bc_directors",
   "name": "British Columbia notice of change of directors",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "BC Registries and Online Services",
   "brief": "A B.C. company files a notice with the registrar when its directors change or a director's address changes. A separate notice is needed for each date of change. The filing fee is $20 plus a $1.50 service fee.",
   "why": "It is a company incorporated in British Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "BC"
      ]
     },
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "not": {
       "q": "ca_federal",
       "yes": true
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days after the change"
   },
   "dueText": "A company must, within 15 days after the date of change in its directors or in the address of any of its directors, file a Notice of Change of Directors with the registrar.",
   "weight": 68,
   "source": "ca_x_src_bc_maint",
   "verified": true,
   "form": "Notice of Change of Directors (Form 10)",
   "penalty": "Failure to comply with the filing requirements of the Business Corporations Act may result in a company being dissolved and struck from the register.",
   "note": "The guide is an older document (file last modified 2023-07-27); confirm the fee.",
   "roll": false
  },
  {
   "id": "ca_x_bc_paytransparency",
   "name": "British Columbia pay transparency report",
   "dept": "labour",
   "head": "Pay and equity reports",
   "authority": "Government of British Columbia (Ministry of Finance, Gender Equity Office)",
   "brief": "B.C. employers above a set size complete a pay transparency report every year and publish it on a public website.",
   "why": "You have 50 or more employees in British Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "BC"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e50",
       "e100"
      ]
     },
     {
      "not": {
       "q": "ca_x_fedreg",
       "yes": true
      }
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      11,
      1
     ]
    ]
   },
   "dueText": "Complete the report by November 1 of each year and publish it on a publicly accessible website as soon as practicable. By November 1, 2026: all employers with 50 employees in B.C. or more.",
   "weight": 70,
   "source": "ca_x_src_bc_pay",
   "verified": true,
   "form": "Pay transparency report (Pay Transparency Reporting Tool)",
   "note": "An employer with no website posts the report in a visible place in each workplace and gives it to anyone who asks. Requirements may differ for federally regulated employers. The page states no penalty.",
   "roll": false
  },
  {
   "id": "ca_x_bc_form7",
   "name": "Report a worker's injury to WorkSafeBC",
   "dept": "labour",
   "head": "Injury reporting",
   "authority": "WorkSafeBC",
   "brief": "A B.C. employer reports every injury to a worker that is, or is claimed to be, work-related. A worker's death, a serious injury and certain major incidents must be reported to WorkSafeBC immediately, which the Form 7 does not replace.",
   "why": "You pay employees in British Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 3 days after the injury; a death immediately"
   },
   "dueText": "An employer must report to the Board, within 3 days after its occurrence, every injury to a worker. An employer must report immediately to the Board the death of a worker.",
   "weight": 84,
   "source": "ca_x_src_bc_wca",
   "verified": true,
   "form": "Employer's Report of Injury or Occupational Disease (Form 7)",
   "penalty": "Employers who do not immediately notify WorkSafeBC of serious incidents may be subject to enforcement, such as an administrative penalty.",
   "note": "If the Board has not received the employer's report within a week, it may decide the claim on an interim basis and begin paying compensation.",
   "roll": false
  },
  {
   "id": "ca_x_bc_jhsc",
   "name": "British Columbia joint health and safety committee: yearly evaluation",
   "dept": "labour",
   "head": "Safety committees",
   "authority": "WorkSafeBC",
   "brief": "A B.C. workplace with 20 or more workers needs a joint health and safety committee, whose members receive eight hours of training and whose effectiveness is evaluated in writing every year.",
   "why": "You have 20 or more workers in British Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     },
     {
      "q": "ca_x_emp_band",
      "is": [
       "e20",
       "e25",
       "e50",
       "e100"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "A written evaluation once a year"
   },
   "dueText": "A written evaluation must be conducted annually to determine the effectiveness of the joint committee. All joint committee members selected on or after April 3, 2017 must receive eight hours of training and instruction.",
   "weight": 60,
   "source": "ca_x_src_bc_jhsc",
   "verified": true,
   "form": "Joint health and safety committee",
   "note": "How often the committee must meet and the deadline for the training were not on the page read.",
   "roll": false
  },
  {
   "id": "ca_x_ab_wcb_injury",
   "name": "Report a worker's injury to WCB Alberta",
   "dept": "labour",
   "head": "Injury reporting",
   "authority": "Workers' Compensation Board – Alberta",
   "brief": "An Alberta employer reports an injury or illness that causes lost time or modified work beyond the day of the accident, death or permanent disability, an occupational disease, treatment beyond first aid or medical aid expenses.",
   "why": "You pay employees in Alberta.",
   "applies": {
    "all": [
     {
      "state": [
       "AB"
      ]
     },
     {
      "q": "ca_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 72 hours of being notified of the injury or illness"
   },
   "dueText": "Report to WCB within 72 hours of being notified of an injury or illness. If your worker lost time from work, notify WCB within 24 hours of the worker's return to work. Immediately report fatalities and serious injuries to the OHS Contact Centre, then report the incident to WCB.",
   "weight": 84,
   "source": "ca_x_src_ab_wcb",
   "verified": true,
   "form": "Employer Report of Injury",
   "note": "Keep a record of every injury or illness, even without first aid, for a minimum of three years. The fact sheet (dated January 17, 2023) does not state the penalty.",
   "roll": false
  },
  {
   "id": "ca_x_ab_change",
   "name": "Alberta notice of change of directors or address",
   "dept": "registry",
   "head": "Corporate filings",
   "authority": "Alberta Corporate Registry",
   "brief": "An Alberta corporation gives an authorized Corporate Registry service provider its address and director changes, and any change of agent for service. Service providers charge a fee.",
   "why": "It is a corporation in Alberta that was not incorporated federally.",
   "applies": {
    "all": [
     {
      "state": [
       "AB"
      ]
     },
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "not": {
       "q": "ca_federal",
       "yes": true
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of the change"
   },
   "dueText": "Address or director updates within 15 days of a change, and agent for service updates as soon as they occur.",
   "weight": 68,
   "source": "ca_x_src_ab_change",
   "verified": true,
   "form": "Change of Director / Change of Address notice",
   "penalty": "If no new agent for service is appointed within one year of the previous agent's revocation or resignation, the corporation can be dissolved by the Registrar of Corporations.",
   "note": "Alberta cooperatives have the same 15 days and pay no fee. The page shows no last-updated date.",
   "roll": false
  },
  {
   "id": "ca_x_ab_pipa",
   "name": "Notify Alberta's privacy commissioner of a breach (PIPA)",
   "dept": "privacy",
   "head": "Privacy breaches",
   "authority": "Office of the Information and Privacy Commissioner of Alberta",
   "brief": "An organization in Alberta notifies the Commissioner of a privacy breach when a reasonable person would consider that there is a real risk of significant harm to someone.",
   "why": "Your business holds personal information about people and operates in Alberta.",
   "applies": {
    "all": [
     {
      "state": [
       "AB"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay"
   },
   "dueText": "Notify the Commissioner without unreasonable delay where a reasonable person would consider that there exists a real risk of significant harm to an individual.",
   "weight": 76,
   "source": "ca_x_src_ab_oipc",
   "verified": true,
   "form": "PIPA Privacy Breach Notification Form",
   "note": "No number of days is set. The page (dated June 2025) does not state the fine.",
   "roll": false
  },
  {
   "id": "ca_x_ab_unclaimed",
   "name": "Alberta unclaimed property: report and hand over",
   "dept": "reporting",
   "head": "Unclaimed property",
   "authority": "Alberta Tax and Revenue Administration",
   "brief": "A business that holds property for an owner (a holder) and finds it has gone unclaimed notifies the owner, then reports the property and pays or delivers it to the province.",
   "why": "The business holds unclaimed money or property that belongs to someone else, in Alberta.",
   "applies": {
    "all": [
     {
      "state": [
       "AB"
      ]
     },
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "cal",
    "days": 120
   },
   "dueText": "Report and remit within 120 days from December 31 of the respective reporting year. Notify property owners between 3 and 8 months prior to transferring the property.",
   "weight": 42,
   "source": "ca_x_src_ab_up",
   "verified": true,
   "form": "Unclaimed property holder report",
   "penalty": "A late holder pays interest on the value of the property from the date the holder was required to pay or deliver it.",
   "note": "How long property must sit before it counts as unclaimed depends on its type and was not read. The page shows no last-updated date.",
   "roll": false
  },
  {
   "id": "ca_x_g_passport_renew",
   "name": "Renew your Canadian passport",
   "dept": "personal",
   "head": "Passport",
   "authority": "Immigration, Refugees and Citizenship Canada (Passport Program)",
   "brief": "An adult Canadian passport is valid for 5 or 10 years. You can renew it online when it expires in the next 6 months or has already expired, as long as it was issued in the last 15 years.",
   "why": "You hold a Canadian passport.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ca_x_g_passport",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 or 10 years: renew in the 6 months before the expiry date on your passport"
   },
   "dueText": "You can renew online if your passport will expire in the next 6 months or is expired right now, and was issued in the last 15 years. A passport issued more than 15 years ago cannot be renewed: you apply for a new passport.",
   "weight": 70,
   "source": "ca_x_g_src_passport_online",
   "verified": true,
   "form": "Adult passport renewal (online, by mail or in person)",
   "penalty": "The page does not state a penalty. A passport that was issued more than 15 years ago, or was a child passport, cannot be renewed and a full new application is needed; a renewal that does not meet all the criteria is rejected and returned.",
   "note": "The 6-month window is the condition for ONLINE renewal; renewal by mail or in person has no stated window other than the 15-year rule.",
   "roll": false
  },
  {
   "id": "ca_x_g_prcard_renew",
   "name": "Renew your permanent resident card",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "Immigration, Refugees and Citizenship Canada",
   "brief": "A PR card is usually valid for 5 years (sometimes 1). You can apply for a new one when it will expire in less than 9 months. Without a valid card you need a travel document to come back to Canada by plane, train, bus or boat.",
   "why": "You are a permanent resident of Canada.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ca_x_g_pr",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years: apply when the card will expire in less than 9 months"
   },
   "dueText": "You can renew your card if it will expire in less than 9 months or has expired. A PR card is usually valid for 5 years; in some cases it is valid for only 1 year.",
   "weight": 75,
   "source": "ca_x_g_src_prcard",
   "verified": true,
   "form": "Application for a PR card (renewal)",
   "penalty": "An expired card does not end permanent resident status, but without a valid card you must apply for a permanent resident travel document (PRTD) to return to Canada (other documents can be used in a private vehicle). Some provincial services may require a valid card.",
   "roll": false
  },
  {
   "id": "ca_x_g_pr_address",
   "name": "Give IRCC your Canadian mailing address after becoming a permanent resident",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "Immigration, Refugees and Citizenship Canada",
   "brief": "New permanent residents who did not give a Canadian mailing address when they landed must send one, so the first PR card can be mailed.",
   "why": "You became a permanent resident without giving IRCC a Canadian mailing address.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ca_x_g_pr",
      "yes": true
     },
     {
      "q": "ca_x_g_pr_noaddr",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 180 days of the day you become a permanent resident"
   },
   "dueText": "You must provide your address within 180 days of the day you become a permanent resident.",
   "weight": 60,
   "source": "ca_x_g_src_prcard_faq",
   "verified": true,
   "form": "Address for the first PR card",
   "penalty": "If you do not send it within 180 days, IRCC cancels the PR card (you then apply for a card).",
   "note": "The help-centre page shows no last-updated date.",
   "roll": false
  },
  {
   "id": "ca_x_g_on_dl_renew",
   "name": "Renew your Ontario driver's licence",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Ontario Ministry of Transportation (ServiceOntario)",
   "brief": "An Ontario driver's licence card is usually renewed every 5 years. Driving on an expired licence is illegal, and the longer it lapses the more tests you must retake.",
   "why": "You hold an Ontario driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date on your licence"
   },
   "dueText": "You need to renew your driver's licence card usually every 5 years.",
   "weight": 75,
   "source": "ca_x_g_src_on_dl",
   "verified": true,
   "form": "Driver's licence renewal (ServiceOntario)",
   "penalty": "It is illegal to drive with an expired, cancelled or suspended driver's licence. A full G or M licence expired 1-3 years: vision test; 3-10 years: vision, written knowledge and G1 and G2 road tests; more than 10 years: re-apply as a new driver.",
   "note": "Drivers aged 80 and over and commercial classes have extra renewal rules not covered here.",
   "roll": false
  },
  {
   "id": "ca_x_g_on_dl_address",
   "name": "Report a new address on your Ontario driver's licence and vehicle permit",
   "dept": "personal",
   "head": "Change of address",
   "authority": "Ontario Ministry of Transportation (ServiceOntario)",
   "brief": "When you move, Ontario requires you to update the address on your driver's licence and vehicle permit within 6 days.",
   "why": "You hold an Ontario driver's licence or own an Ontario-registered vehicle and have moved.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_x_g_moved",
      "yes": true
     },
     {
      "any": [
       {
        "q": "ca_x_g_dl",
        "yes": true
       },
       {
        "q": "ca_x_g_vehicle",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 6 days of your address changing"
   },
   "dueText": "You must update your driver's licence and vehicle permit within 6 days of your address changing.",
   "weight": 55,
   "source": "ca_x_g_src_on_addr",
   "verified": true,
   "form": "Change of address (ServiceOntario)",
   "note": "The page states no penalty.",
   "roll": false
  },
  {
   "id": "ca_x_g_on_health_address",
   "name": "Report a new address on your Ontario health card",
   "dept": "personal",
   "head": "Change of address",
   "authority": "Ontario Ministry of Health (ServiceOntario)",
   "brief": "When you move, Ontario requires you to update the address on your health card within 30 days.",
   "why": "You have an Ontario health card and have moved.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_x_g_moved",
      "yes": true
     },
     {
      "q": "ca_x_g_health",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days of your address changing"
   },
   "dueText": "You must update the address on your health card within 30 days of your address changing.",
   "weight": 50,
   "source": "ca_x_g_src_on_addr",
   "verified": true,
   "form": "Change of address (ServiceOntario)",
   "note": "The page states no penalty.",
   "roll": false
  },
  {
   "id": "ca_x_g_on_health_renew",
   "name": "Renew your Ontario health card",
   "dept": "personal",
   "head": "Health coverage",
   "authority": "Ontario Ministry of Health (ServiceOntario)",
   "brief": "The Ontario photo health card must be renewed every 5 years. You need a valid card to get OHIP coverage. Online renewal is open from 180 days before to 180 days after expiry.",
   "why": "You have an Ontario health card.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_x_g_health",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date on the card (online renewal opens 180 days before)"
   },
   "dueText": "You must renew your health card every 5 years. You can renew online if your card will expire within 180 days or expired within the past 180 days.",
   "weight": 70,
   "source": "ca_x_g_src_on_health",
   "verified": true,
   "form": "Health card renewal (ServiceOntario)",
   "penalty": "You need a valid card to get coverage through OHIP; if the card has already expired you may need extra documents to confirm Ontario is your primary residence.",
   "note": "Holders of the old red-and-white card must replace it in person; that is not modelled as a date.",
   "roll": false
  },
  {
   "id": "ca_x_g_on_plate_renew",
   "name": "Renew your Ontario licence plate",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Ontario Ministry of Transportation (ServiceOntario)",
   "brief": "Ontario plates must stay valid. Plates on passenger vehicles, light commercial vehicles under 3,000 kg, motorcycles and mopeds renew automatically for 1 year, 90 days before expiry, only if the vehicle is insured and there are no unpaid fines or tolls; other plates are renewed by hand.",
   "why": "You own a vehicle registered in Ontario.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "ON"
      ]
     },
     {
      "q": "ca_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, before the plate's expiry date (automatic renewal runs 90 days before it if insurance is valid and no fines or tolls are unpaid)"
   },
   "dueText": "Your licence plate is automatically renewed 90 days before expiration. For your licence plate to renew automatically you must have valid insurance and no outstanding fines or tolls. Automatic renewals are valid for 1 year.",
   "weight": 60,
   "source": "ca_x_g_src_on_plate",
   "verified": true,
   "form": "Licence plate renewal (no fee, no sticker)",
   "penalty": "The page says only that a vehicle must have a valid licence plate and be insured to drive legally in Ontario; no fine is stated.",
   "note": "Commercial and business vehicles, motorhomes, pre-1983 vehicles, buses and snowmobiles are not renewed automatically. The expiry date is not stated on the page; owners check it with the online tool.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_dl_renew",
   "name": "Renew your B.C. driver's licence",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Insurance Corporation of British Columbia (ICBC) / RoadSafetyBC",
   "brief": "A standard B.C. driver's licence must be renewed every 5 years. You can renew up to 6 months before it expires.",
   "why": "You hold a B.C. driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date (you can renew up to 6 months before it expires)"
   },
   "dueText": "In B.C., you must renew your standard driver's licence every 5 years. You can renew up to 6 months before it expires.",
   "weight": 75,
   "source": "ca_x_g_src_bc_seniors",
   "verified": true,
   "form": "Driver's licence renewal (ICBC driver licensing office)",
   "note": "The page read does not state what happens if the licence lapses. Drivers from age 80 also get medical reports, not modelled here.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_card_renew",
   "name": "Renew your BC Services Card (and your MSP enrolment)",
   "dept": "personal",
   "head": "Health coverage",
   "authority": "Government of British Columbia (Health Insurance BC / ICBC)",
   "brief": "The BC Services Card shows an expiry date. Renewing the card also renews your enrolment in the Medical Services Plan (MSP). Renew before that date, or as soon as you can if it has already expired.",
   "why": "You have a BC Services Card.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_x_g_health",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the expiry date printed on the card"
   },
   "dueText": "Get a card before your existing card expires – or if it's already expired. When you renew your BC Services Card, you are also renewing your enrolment in the Medical Services Plan.",
   "weight": 65,
   "source": "ca_x_g_src_bc_card",
   "verified": true,
   "form": "BC Services Card renewal",
   "note": "The pages read do not state how many years the card is valid, nor what happens to MSP coverage if it lapses. A combined card is renewed with the driver's licence.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_msp_address",
   "name": "Report a new address to Health Insurance BC (MSP)",
   "dept": "personal",
   "head": "Change of address",
   "authority": "Health Insurance BC (Ministry of Health)",
   "brief": "The Medicare Protection Act requires you to update your MSP address within 10 days of moving. Drivers can update ICBC and Health Insurance BC together online.",
   "why": "You are enrolled in B.C.'s Medical Services Plan and have moved.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_x_g_moved",
      "yes": true
     },
     {
      "q": "ca_x_g_health",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days of the change of address"
   },
   "dueText": "The Medicare Protection Act requires individuals to update their address within 10 days of the change.",
   "weight": 50,
   "source": "ca_x_g_src_bc_msp_move",
   "verified": true,
   "form": "MSP change of address",
   "note": "The page was last updated in 2020. A 10-day rule for the driver's licence address is quoted by ICBC but its page could not be read (content loads by script), so it is not included separately.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_vehicle_renew",
   "name": "Renew your B.C. vehicle licence and insurance (Autoplan)",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Insurance Corporation of British Columbia (ICBC)",
   "brief": "In B.C. a vehicle's licence and its basic insurance are renewed together with ICBC before the policy expires. Renewal opens 44 days before the expiry date. B.C. no longer issues plate decals, so police check by scanning plates.",
   "why": "You own a vehicle registered in B.C.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "BC"
      ]
     },
     {
      "q": "ca_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the policy expiry date (renewal opens 44 days before it)"
   },
   "dueText": "ICBC customers are able to renew their auto insurance policy as early as 44 days before the expiry date.",
   "weight": 60,
   "source": "ca_x_g_src_icbc_uninsured",
   "verified": false,
   "form": "Autoplan renewal (ICBC)",
   "penalty": "If police find the vehicle uninsured, the vehicle will be towed and you receive a ticket that comes with a $598 fine (figure quoted in ICBC's June 2024 release).",
   "note": "Read on a 2024 ICBC news release, not a standing rule page; the policy term (commonly 12 months) was not stated on any page read, and the fine may have changed.",
   "roll": false
  },
  {
   "id": "ca_x_g_qc_dl_fees",
   "name": "Pay your Québec driver's licence annual fees (renewal)",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Société de l'assurance automobile du Québec (SAAQ)",
   "brief": "In Québec the driver's licence is kept valid by paying annual fees (driving privilege, insurance contribution, administration). The SAAQ mails a notice every year before your birthday, and the deadline is your birthday.",
   "why": "You hold a Québec driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "QC"
      ]
     },
     {
      "q": "ca_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, by your birthday (the deadline on the SAAQ payment notice)"
   },
   "dueText": "Every year before your birthday, you will receive a payment notice by mail. The payment notice indicates the deadline to renew your driver's licence, which is actually your birthday. Pay by the deadline indicated on the notice.",
   "weight": 75,
   "source": "ca_x_g_src_qc_lic",
   "verified": true,
   "form": "SAAQ payment notice",
   "penalty": "Late payment fee (minimum) $13.50. Driving without a valid licence is an offence punishable by a fine of $300 to $600, plus other fees, and the vehicle may be seized and impounded for 30 days. After 3 consecutive years or more unpaid, you must pass the knowledge and road tests again. If you choose not to renew you must tell the SAAQ before the due date, or you pay part of the fees.",
   "note": "The plastic card itself is replaced on a separate cycle (the SAAQ reuses the latest photo); that cycle is not stated on the page.",
   "roll": false
  },
  {
   "id": "ca_x_g_qc_reg_renew",
   "name": "Pay your Québec vehicle registration (annual renewal)",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Société de l'assurance automobile du Québec (SAAQ)",
   "brief": "A vehicle registered in Québec has its registration renewed by an annual payment to the SAAQ, by the date on the payment notice.",
   "why": "You own a vehicle registered in Québec.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "QC"
      ]
     },
     {
      "q": "ca_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, by the payment due date on the SAAQ notice"
   },
   "dueText": "Not read on the official page (bot check). Reported elsewhere: the renewal month depends on the first letter of the owner's surname.",
   "weight": 60,
   "source": "ca_x_g_src_qc_reg",
   "verified": false,
   "form": "SAAQ registration payment notice",
   "note": "UNVERIFIED. The SAAQ registration page refused automated access. The month-by-surname schedule and any late consequences must be read on the SAAQ page before use.",
   "roll": false
  },
  {
   "id": "ca_x_g_ab_dl_renew",
   "name": "Renew your Alberta driver's licence",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Government of Alberta (Alberta Registries)",
   "brief": "An Alberta driver's licence is valid for one to five years depending on its class, and it expires on your birthday. Alberta no longer mails reminders: you can sign up for them with eServices.",
   "why": "You hold an Alberta driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "AB"
      ]
     },
     {
      "q": "ca_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 1 to 5 years (by class), on your birthday when the licence expires"
   },
   "dueText": "A driver's licence is valid for one to five years, depending on the class and expires on your birthday.",
   "weight": 75,
   "source": "ca_x_g_src_ab_faq",
   "verified": true,
   "form": "Driver's licence renewal (registry agent or online)",
   "note": "The pages read do not state the consequences of driving on an expired licence or the re-test thresholds (the operator manual that states them requires sign-in).",
   "roll": false
  },
  {
   "id": "ca_x_g_ab_reg_renew",
   "name": "Renew your Alberta vehicle registration",
   "dept": "personal",
   "head": "Driving and vehicles",
   "authority": "Government of Alberta (Alberta Registries)",
   "brief": "Alberta vehicle registrations expire at the end of a month assigned by the owner's surname. Mail-in renewal is only for registrations expiring in 30 days or more.",
   "why": "You own a vehicle registered in Alberta.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "AB"
      ]
     },
     {
      "q": "ca_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the end of the month assigned to your surname, when the registration expires"
   },
   "dueText": "Vehicle registrations expire at the end of an assigned month, based on your surname. You should only use the mail-in renewal option if your registration expires in 30 days or more.",
   "weight": 65,
   "source": "ca_x_g_src_ab_reg",
   "verified": true,
   "form": "Vehicle registration renewal (registry agent, online or mail)",
   "note": "The registration term and the consequences of an expired registration were not stated on the pages read. The surname-to-month chart is linked from the page.",
   "roll": false
  },
  {
   "id": "ca_x_g_ab_address",
   "name": "Report a new address on your Alberta driver's licence and vehicle registration",
   "dept": "personal",
   "head": "Change of address",
   "authority": "Government of Alberta (Alberta Registries)",
   "brief": "Alberta requires you to update your driver's licence and vehicle registration within 14 days of a change to your personal information, such as your address. You apply at a registry agent in person.",
   "why": "You hold an Alberta driver's licence or own an Alberta-registered vehicle and have moved.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "AB"
      ]
     },
     {
      "q": "ca_x_g_moved",
      "yes": true
     },
     {
      "any": [
       {
        "q": "ca_x_g_dl",
        "yes": true
       },
       {
        "q": "ca_x_g_vehicle",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days of a change to your personal information"
   },
   "dueText": "You have to update your driver's licence or vehicle registration within 14 days of a change to your personal information.",
   "weight": 55,
   "source": "ca_x_g_src_ab_update",
   "verified": true,
   "form": "Change of address (registry agent, in person)",
   "note": "A fee applies unless combined with an early renewal. No penalty is stated.",
   "roll": false
  },
  {
   "id": "ca_x_g_pal_renew",
   "name": "Renew your firearms licence (PAL)",
   "dept": "personal",
   "head": "Firearms",
   "authority": "Royal Canadian Mounted Police (Canadian Firearms Program)",
   "brief": "An adult firearms licence expires five years after the holder's birthday following the day it was issued. The RCMP sends a renewal notice three months before expiry. A licence not renewed in time is extended for six months, but during that time you may not use or acquire firearms or ammunition.",
   "why": "You hold a firearms licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ca_x_g_pal",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date (the renewal notice comes 3 months before)"
   },
   "dueText": "A licence issued to an individual who is eighteen years old or older expires on the earlier of five years after the birthday of the holder next following the day on which it is issued, and the expiration of the period for which it is expressed to be issued.",
   "weight": 55,
   "source": "ca_x_g_src_fa64",
   "verified": true,
   "form": "Firearms licence renewal (RCMP 5592 / online)",
   "penalty": "If not renewed before it expires, the licence is extended for six months, but the holder may not use firearms or acquire firearms, ammunition or cartridge magazines until it is renewed, and any authorization to carry or transport is not extended. An expired licence cannot be renewed online.",
   "note": "RCMP page: renewal notices are sent three months before the date of expiry (page modified 2024-10-25).",
   "roll": false
  },
  {
   "id": "ca_x_g_nexus_renew",
   "name": "Renew your NEXUS membership",
   "dept": "personal",
   "head": "Travel documents",
   "authority": "Canada Border Services Agency (with U.S. Customs and Border Protection)",
   "brief": "NEXUS membership is valid for 5 years. If you renew before the expiry date, you keep your NEXUS privileges while the renewal is processed.",
   "why": "You are a NEXUS member.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ca_x_g_nexus",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date on your NEXUS card"
   },
   "dueText": "Your NEXUS membership is valid for 5 years. If you renew your membership before the expiry date, you can retain your NEXUS privileges.",
   "weight": 35,
   "source": "ca_x_g_src_nexus",
   "verified": true,
   "form": "NEXUS renewal (Trusted Traveler Programs account)",
   "penalty": "Renewing after the expiry date loses the privileges kept by an on-time renewal (the page does not say more).",
   "note": "How early renewal opens is not stated on the CBSA page.",
   "roll": false
  },
  {
   "id": "ca_x_g_cad_5days",
   "name": "Account for imported goods (Commercial Accounting Declaration)",
   "dept": "trade",
   "head": "Import accounting",
   "authority": "Canada Border Services Agency",
   "brief": "When commercial goods are released before the duties are paid (release prior to payment), the importer, or its customs broker, must account for them by filing the final accounting within five business days after release.",
   "why": "The business imports commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_imports",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within five business days after the goods are released"
   },
   "dueText": "If commercial goods are released under paragraph 32(2)(a) of the Act in accordance with section 9, the person required by the Act to account for the goods must do so ... within five business days after their release.",
   "weight": 75,
   "source": "ca_x_g_src_aigpdr",
   "verified": true,
   "form": "Commercial Accounting Declaration (CAD) in the CARM Client Portal",
   "penalty": "Failing to submit final accounting may lead to Late Accounting Penalties (LAPs) per individual overdue transaction (Customs Notice 25-16).",
   "note": "Business day here means a day other than Saturday or a holiday. Customs Self-Assessment importers follow other rules.",
   "roll": false
  },
  {
   "id": "ca_x_g_carm_pay",
   "name": "Pay the monthly customs statement of account",
   "dept": "trade",
   "head": "Import accounting",
   "authority": "Canada Border Services Agency",
   "brief": "Under CARM, duties and taxes on imports are billed on a monthly Statement of Account issued on the 25th. Payment is due 10 weekdays after the 17th, and must reach the CBSA by 16:00 Eastern time on that day.",
   "why": "The business imports commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_imports",
      "yes": true
     }
    ]
   },
   "frequency": "monthly",
   "due": {
    "t": "event",
    "text": "Every month, 10 weekdays (Monday to Friday, holidays included) after the 17th, by 16:00 Eastern time"
   },
   "dueText": "The payment due date is 10 weekdays (defined as Monday to Friday, inclusive of holidays) after the 17th. All payments of monthly customs account balances must be received by the CBSA by 16:00 Eastern time on the payment due date.",
   "weight": 75,
   "source": "ca_x_g_src_carm_sched",
   "verified": true,
   "form": "Statement of Account (CARM Client Portal)",
   "penalty": "If full payment has not been received by the payment deadline, a late payment penalty may be applied and late payment interest may be applied on the outstanding balance; an account with unpaid debt is not in good standing (the CBSA may claim against security, apply a lien or require payment at release).",
   "note": "The CBSA publishes the exact payment due dates at the start of each calendar year (D17-5-1).",
   "roll": false
  },
  {
   "id": "ca_x_g_import_correct",
   "name": "Correct a wrong import declaration (origin, tariff classification or value)",
   "dept": "trade",
   "head": "Import accounting",
   "authority": "Canada Border Services Agency",
   "brief": "An importer who has reason to believe that a declaration of origin, tariff classification or value for duty is wrong must correct it and pay any extra duties and interest within 90 days. The duty lasts for four years after the goods were accounted for.",
   "why": "The business imports commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_imports",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within ninety days after you have reason to believe the declaration is incorrect"
   },
   "dueText": "Shall, within ninety days after the importer, owner or person has reason to believe that the declaration of origin, declaration of tariff classification or declaration of value for duty made under this Act for any of those goods is incorrect, make a correction ... and pay any amount owing as duties ... and any interest.",
   "weight": 55,
   "source": "ca_x_g_src_customs_act",
   "verified": true,
   "form": "Correction (CAD adjustment)",
   "note": "Customs Act s. 32.2(1)-(2) and (4): the obligation ends four years after the goods are accounted for, and does not apply to corrections that would give a refund. The Act section does not state a penalty; AMPS may apply.",
   "roll": false
  },
  {
   "id": "ca_x_g_import_records",
   "name": "Keep import records for six years",
   "dept": "trade",
   "head": "Import and export records",
   "authority": "Canada Border Services Agency",
   "brief": "Importers of commercial goods keep all records about those goods (invoices, contracts, payment, origin and classification records) for six years after the import, normally at their place of business in Canada.",
   "why": "The business imports commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_imports",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Six years following the importation of the goods (keep records for that long)"
   },
   "dueText": "Keep, for the period of six years following the importation of the commercial goods, all records ... Generally, an importer is required to maintain records at its place of business in Canada.",
   "weight": 50,
   "source": "ca_x_g_src_d17121",
   "verified": true,
   "penalty": "If an importer fails to meet record-keeping requirements, the CBSA may assess Administrative Monetary Penalty System (AMPS) penalties.",
   "note": "Keeping records outside Canada needs CBSA authorization (form BSF900).",
   "roll": false
  },
  {
   "id": "ca_x_g_export_declare",
   "name": "Report exported goods before they leave Canada (export declaration)",
   "dept": "trade",
   "head": "Export reporting",
   "authority": "Canada Border Services Agency",
   "brief": "Exporters report commercial goods to the CBSA before export: at least 48 hours before loading on a ship, 2 hours before loading on a plane, delivery to the post office or train assembly, and immediately before export by road. Non-restricted commercial goods under CAD 2,000 are exempt.",
   "why": "The business exports commercial goods that must be reported.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_exports",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each export: not less than 48 hours before loading on a vessel, 2 hours before loading on an aircraft, delivery to the post office or train assembly, and immediately before export by highway"
   },
   "dueText": "The minimum timeframes for reporting exports: by mail, not less than 2 hours before the goods are delivered to the post office; by marine vessel, not less than 48 hours before the goods are loaded; by aircraft, not less than 2 hours before loading; by rail, not less than 2 hours before the train is assembled; by any other mode, immediately before the exportation.",
   "weight": 65,
   "source": "ca_x_g_src_d2011",
   "verified": true,
   "form": "Export declaration (CERS Portal or G7 EDI)",
   "penalty": "When an exporter infraction is determined, a penalty may be applied against the exporter (AMPS); seizure or ascertained forfeiture may also apply. Failing to report amendments or cancellations may also be penalized.",
   "note": "Goods to the U.S. are mostly exempt unless restricted (then the permit is presented). Live animals and bulk or time-sensitive goods may be reported immediately before export. CERS declarations can be voided up to 90 days after submission if the goods are not exported.",
   "roll": false
  },
  {
   "id": "ca_x_g_export_srp",
   "name": "Monthly export summary report (Summary Reporting Program)",
   "dept": "trade",
   "head": "Export reporting",
   "authority": "Canada Border Services Agency",
   "brief": "Exporters approved for the Summary Reporting Program send one report of the previous month's exports within 5 business days after the month ends, and a nil report when nothing was exported.",
   "why": "The business is approved for the CBSA Summary Reporting Program.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_exports",
      "yes": true
     },
     {
      "q": "ca_x_g_srp",
      "yes": true
     }
    ]
   },
   "frequency": "monthly",
   "due": {
    "t": "event",
    "text": "Every month, within 5 business days following the end of the month in which the goods are exported"
   },
   "dueText": "SRP participants are required to submit a report covering the previous calendar month to the CBSA within 5 business days following the end of the month in which the goods are exported. If there is nothing to report, a nil report must still be submitted.",
   "weight": 40,
   "source": "ca_x_g_src_d2011",
   "verified": true,
   "form": "Summary report (CERS Portal)",
   "penalty": "Failure to provide a report or meet the 5 business days reporting timeframe may result in an administrative monetary penalty; the report must still be filed.",
   "note": "Amendments to a summary report are due within 30 days of discovering the error.",
   "roll": false
  },
  {
   "id": "ca_x_g_export_records",
   "name": "Keep export records for six years",
   "dept": "trade",
   "head": "Import and export records",
   "authority": "Canada Border Services Agency",
   "brief": "A business that exports commercial goods keeps all records about those exports for six years after the export, at its place of business in Canada, and shows them to a CBSA officer on request.",
   "why": "The business exports commercial goods.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_trade",
      "yes": true
     },
     {
      "q": "ca_x_g_exports",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Six years following the exportation of the goods (keep records for that long)"
   },
   "dueText": "Every person who exports or causes to be exported commercial goods ... shall keep, for the period of six years following the exportation of the commercial goods, all records that relate to the exportation.",
   "weight": 40,
   "source": "ca_x_g_src_eprr",
   "verified": true,
   "note": "Customs Act s. 97.2(1) creates the duty; the Regulations set the six years. Exporters who signed a free-trade certificate of origin keep the origin records six years from signing. The Regulations do not state a penalty.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_unclaimed_notify",
   "name": "B.C. unclaimed property: try to find and notify the owner",
   "dept": "reporting",
   "head": "Unclaimed property",
   "authority": "Government of British Columbia (Office of the Comptroller General) / BC Unclaimed Property Society",
   "brief": "A business holding money or property for an owner whose last known address is in B.C. must make reasonable efforts to find and notify the owner within 6 months after the date the regulations set for that type of property. If the owner is still not found 12 months after that date, the property becomes unclaimed.",
   "why": "The business holds money or property belonging to someone else that has gone unclaimed, for an owner in B.C.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_unclaimed",
      "yes": true
     },
     {
      "state": [
       "BC"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 6 months after the applicable date prescribed for that type of property"
   },
   "dueText": "A holder of property must make reasonable efforts to locate the owner and to notify the owner about the property ... The reasonable efforts required ... must be made within 6 months after the applicable date.",
   "weight": 30,
   "source": "ca_x_g_src_bc_upa",
   "verified": true,
   "penalty": "A holder who contravenes section 9 commits an offence; directors or officers who authorize it also commit an offence (Unclaimed Property Act s. 16).",
   "note": "The 'applicable date' and minimum value for each type of property are set in the regulation, which was not read. Applies to circumstances after July 1, 2000.",
   "roll": false
  },
  {
   "id": "ca_x_g_bc_unclaimed_db",
   "name": "B.C. unclaimed property: keep a public database (or transfer to the Society)",
   "dept": "reporting",
   "head": "Unclaimed property",
   "authority": "Government of British Columbia (Office of the Comptroller General) / BC Unclaimed Property Society",
   "brief": "Once property becomes unclaimed, the holder must keep a database of it that the public can search, and keep the records the regulations require. A holder can instead give the particulars to, or transfer unclaimed money to, the BC Unclaimed Property Society with its consent.",
   "why": "The business holds unclaimed money or property for an owner in B.C.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_unclaimed",
      "yes": true
     },
     {
      "state": [
       "BC"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "From the day the property becomes unclaimed (12 months after the applicable date if the owner was not found)"
   },
   "dueText": "If, despite the holder's reasonable efforts, the owner is not located and notified within 12 months after the applicable date, the property becomes unclaimed. A holder of unclaimed property must maintain a database of all unclaimed property held by the holder and make the database available to the public.",
   "weight": 25,
   "source": "ca_x_g_src_bc_upa",
   "verified": true,
   "penalty": "A holder who fails to maintain a record required under the Act commits an offence (s. 16).",
   "note": "There is no fixed annual report date in the Act; transfer to the Society is voluntary (s. 12).",
   "roll": false
  },
  {
   "id": "ca_x_g_qc_unclaimed_remit",
   "name": "Québec unclaimed financial assets: remit to Revenu Québec",
   "dept": "reporting",
   "head": "Unclaimed property",
   "authority": "Revenu Québec",
   "brief": "A business holding unclaimed financial assets (money owed to someone who cannot be reached) for a Québec owner registers with Revenu Québec and remits them, reported in search results as during the first quarter after the end of the calendar year in which they became unclaimed.",
   "why": "The business holds unclaimed money or property belonging to someone else, in Québec.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_unclaimed",
      "yes": true
     },
     {
      "state": [
       "QC"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, in the first quarter after the end of the calendar year in which the assets became unclaimed (not confirmed on the official page)"
   },
   "dueText": "Not read on the official page (HTTP 403). Search summary of the Revenu Québec page: since June 4, 2025, all holders of unclaimed financial assets must remit them during the first quarter following the end of the calendar year in which they became unclaimed.",
   "weight": 30,
   "source": "ca_x_g_src_qc_ufa",
   "verified": false,
   "form": "BD-81.5-V, Statement Concerning Unclaimed Property (10 or fewer assets)",
   "penalty": "Not confirmed: late remittance is said to bring interest and penalties.",
   "note": "UNVERIFIED. Revenu Québec pages refused automated access; LégisQuébec also returned 403. The deadline, transition for fiscal years ending June-December 2025, the dormancy periods and penalties must be read on the official page before use.",
   "roll": false
  },
  {
   "id": "ca_x_g_patent_maint",
   "name": "Pay patent maintenance fees (patents and pending applications)",
   "dept": "ip",
   "head": "Intellectual property",
   "authority": "Canadian Intellectual Property Office",
   "brief": "A Canadian patent, and a pending patent application, stay in force only if a maintenance fee is paid every year, starting with the second anniversary of the filing date. A late payment needs an extra late fee; if both are not paid in time, the application is deemed abandoned or the patent deemed expired.",
   "why": "You own a Canadian patent or have an application pending.",
   "applies": {
    "q": "ca_x_g_patent",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, on or before each anniversary of the filing date, starting with the second"
   },
   "dueText": "To maintain the rights accorded by a patent ... the prescribed fees shall be paid on or before the prescribed dates (the second, third and fourth anniversaries of the filing date, and each later anniversary). If not paid, the fee and late fee must be paid before the later of six months after the date and two months after the Commissioner's notice.",
   "weight": 60,
   "source": "ca_x_g_src_patent_act",
   "verified": true,
   "form": "Maintenance fee (CIPO)",
   "penalty": "Late fee of CAD 150.00. If the fee and late fee are not paid before the later of six months after the due date and two months after CIPO's notice, a patent's term is deemed to have expired on the due date (an application is deemed abandoned); reversal or reinstatement needs a request, reasons and a further fee (CAD 297.00).",
   "note": "Patent Act s. 27.1 (applications) and s. 46 (patents). The anniversary schedule is read on CIPO's fee page (modified 2026-11-05). Fee amounts change every January.",
   "roll": false
  },
  {
   "id": "ca_x_g_design_maint",
   "name": "Pay the industrial design maintenance fee",
   "dept": "ip",
   "head": "Intellectual property",
   "authority": "Canadian Intellectual Property Office",
   "brief": "A registered industrial design is protected beyond five years only if one maintenance fee is paid no later than five years after registration. It can still be paid within six months after that, on request, with a late fee. If it is not paid, the protection is deemed to have expired.",
   "why": "You own a registered industrial design in Canada.",
   "applies": {
    "q": "ca_x_g_design",
    "yes": true
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 5 years after the date the design was registered"
   },
   "dueText": "The fee for the maintenance of the exclusive right accorded by the registration of a design must be paid no later than five years after the date of registration of the design. It may be paid within six months after the end of that five-year period if the proprietor makes a request and pays both the maintenance fee and the late fee.",
   "weight": 45,
   "source": "ca_x_g_src_idr",
   "verified": true,
   "form": "Maintenance fee (CIPO)",
   "penalty": "Late fee CAD 63.00 (within the six months, on request). If the fee is not paid within the time allowed, the term of the exclusive right is deemed to have expired at the end of that time (Industrial Design Act s. 10(3)).",
   "note": "Protection then runs to the later of 10 years after registration and 15 years after filing. The fee in the regulation schedule (CAD 496.00) is indexed yearly; check CIPO's current fee.",
   "roll": false
  },
  {
   "id": "ca_x_g_fcp_aiee",
   "name": "Sign the Agreement to Implement Employment Equity before bidding (Federal Contractors Program)",
   "dept": "labour",
   "head": "Government contracts",
   "authority": "Employment and Social Development Canada (Labour Program)",
   "brief": "Suppliers with 100 or more permanent employees in Canada who bid on a federal goods or services contract of $1 million or more must sign an Agreement to Implement Employment Equity before bidding. The commitment continues after the contract ends and is checked by compliance assessments.",
   "why": "The business has 100+ permanent employees in Canada and bids on federal contracts of $1 million or more.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "trust",
       "nonprofit"
      ]
     },
     {
      "q": "ca_x_g_fcp",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Before you bid on the first federal contract of $1 million or more"
   },
   "dueText": "Before bidding, organizations must sign an Agreement to Implement Employment Equity (AIEE), which goes beyond the life of the original contract and is an ongoing obligation.",
   "weight": 30,
   "source": "ca_x_g_src_fcp",
   "verified": true,
   "form": "Agreement to Implement Employment Equity (AIEE)",
   "penalty": "Organizations found non-compliant after a compliance assessment, or that withdraw, are placed on the Limited Eligibility to Bid list and should not receive future federal goods or services contracts.",
   "note": "The page states no reporting deadline for contractors; compliance assessments are scheduled by the Labour Program. Employers already covered by the Employment Equity Act are not under the FCP (not re-checked here).",
   "roll": false
  }
 ],
 "sources": [
  {
   "id": "ca_x_src_isc_file",
   "title": "Individuals with significant control - File your information",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/individuals-significant-control/individuals-significant-control-file-your-information",
   "publisher": "Corporations Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_cbca_next",
   "title": "Next steps following the incorporation of your business",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/business-corporations/next-steps-following-incorporation-your-business",
   "publisher": "Corporations Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_cbca_shares",
   "title": "Share structure and shareholders",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/business-corporations/share-structure-and-shareholders",
   "publisher": "Corporations Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_nfp",
   "title": "Your reporting obligations under the Canada Not-for-profit Corporations Act (NFP Act)",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/not-profit-corporations/your-reporting-obligations-under-canada-not-profit-corporations-act-nfp-act",
   "publisher": "Corporations Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_roe",
   "title": "Employers: How to complete the record of employment (ROE) form",
   "url": "https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/reports/roe-guide/understand.html",
   "publisher": "Employment and Social Development Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_payeq",
   "title": "Obligation 3: File an Annual Statement",
   "url": "https://www.chrc-ccdp.gc.ca/organizations/pay-equity-act-responsibilities/obligation-3-file-annual-statement",
   "publisher": "Canadian Human Rights Commission (Office of the Pay Equity Commissioner)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ee",
   "title": "Federally regulated private-sector employers and Crown corporations",
   "url": "https://www.canada.ca/en/employment-social-development/corporate/portfolio/labour/programs/employment-equity/private-sector-employers-crown-corporations.html",
   "publisher": "Employment and Social Development Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_hs_who",
   "title": "Employer's Annual Health and Safety Reports: Who must submit",
   "url": "https://www.canada.ca/en/employment-social-development/services/health-safety/workplace-safety/employer-annual-report/who-must-submit.html",
   "publisher": "Employment and Social Development Canada (Labour Program)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_hs_complete",
   "title": "Employer's Annual Health and Safety Reports: How to complete",
   "url": "https://www.canada.ca/en/employment-social-development/services/health-safety/workplace-safety/employer-annual-report/complete.html",
   "publisher": "Employment and Social Development Canada (Labour Program)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_aca",
   "title": "Summary of the Accessible Canada Regulations",
   "url": "https://www.canada.ca/en/employment-social-development/programs/accessible-canada/regulations-summary-act.html",
   "publisher": "Employment and Social Development Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_opc",
   "title": "What you need to know about mandatory reporting of breaches of security safeguards",
   "url": "https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/privacy-breaches-at-your-business/gd_pb_201810/",
   "publisher": "Office of the Privacy Commissioner of Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_casl",
   "title": "Getting consent to send email",
   "url": "https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/getting-consent-send-email",
   "publisher": "Innovation, Science and Economic Development Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_lctr",
   "title": "Reporting large cash transactions to FINTRAC : FINTRAC's compliance guidance",
   "url": "https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/lctr-doie/lctr-doie-eng",
   "publisher": "FINTRAC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_str",
   "title": "Reporting suspicious transactions to FINTRAC : FINTRAC's compliance guidance",
   "url": "https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/str-dod/str-dod-eng",
   "publisher": "FINTRAC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_eft",
   "title": "Reporting electronic funds transfers to FINTRAC : FINTRAC's compliance guidance",
   "url": "https://fintrac-canafe.canada.ca/guidance-directives/transaction-operation/eft-dt/eft-dt-eng",
   "publisher": "FINTRAC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_fintrac_cp",
   "title": "Compliance program requirements : FINTRAC's compliance guidance",
   "url": "https://fintrac-canafe.canada.ca/guidance-directives/compliance-conformite/Guide4/4-eng",
   "publisher": "FINTRAC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_msb",
   "title": "Answer clarification requests, Update, Renew or Cancel your registration",
   "url": "https://fintrac-canafe.canada.ca/msb-esm/register-inscrire/respond-eng",
   "publisher": "FINTRAC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_rm",
   "title": "Register for or modify an import-export program account",
   "url": "https://www.canada.ca/en/border-services-agency/services/carm/register-modify-account.html",
   "publisher": "Canada Border Services Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ica",
   "title": "Frequently asked questions - Investment Canada Act",
   "url": "https://ised-isde.canada.ca/site/investment-canada-act/en/investment-canada-act/frequently-asked-questions",
   "publisher": "Innovation, Science and Economic Development Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_tm",
   "title": "Renewals",
   "url": "https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/trademarks/practice-notices/renewals",
   "publisher": "Canadian Intellectual Property Office",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_supply",
   "title": "Reporting obligations",
   "url": "https://www.publicsafety.gc.ca/cnt/cntrng-crm/frcd-lbr-cndn-spply-chns/rprtng-blgtns-en.aspx",
   "publisher": "Public Safety Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_statcan",
   "title": "Frequently asked questions—Information for survey participants",
   "url": "https://www.statcan.gc.ca/en/survey/faq",
   "publisher": "Statistics Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_osfi49",
   "title": "OSFI 49 Annual Information Return, OSFI 49A Schedule A - Canada Revenue Agency Information Requirements and the Pension Plan Annual Corporate Certification",
   "url": "https://www.osfi-bsif.gc.ca/en/supervision/pensions/administering-pension-plans/guidance-topic/osfi-49-annual-information-return-osfi-49a-schedule-canada-revenue-agency-information-requirements",
   "publisher": "Office of the Superintendent of Financial Institutions",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_npri",
   "title": "Reporting requirements fact sheet: National Pollutant Release Inventory",
   "url": "https://www.canada.ca/en/environment-climate-change/services/national-pollutant-release-inventory/report/requirements-fact-sheet.html",
   "publisher": "Environment and Climate Change Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_aoda",
   "title": "Completing your accessibility compliance report",
   "url": "https://www.ontario.ca/page/completing-your-accessibility-compliance-report",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_posters",
   "title": "Posters required in the workplace",
   "url": "https://www.ontario.ca/page/posters-required-workplace",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_disconnect",
   "title": "Written policy on disconnecting from work (Your guide to the Employment Standards Act)",
   "url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/written-policy-disconnecting-from-work",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_emon",
   "title": "Written policy on electronic monitoring of employees (Your guide to the Employment Standards Act)",
   "url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/written-policy-electronic-monitoring-employees",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_jhsc",
   "title": "Guide for health and safety committees and representatives",
   "url": "https://www.ontario.ca/page/guide-health-and-safety-committees-and-representatives",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_form7",
   "title": "Report an injury or illness",
   "url": "https://www.wsib.ca/en/businesses/claims/report-injury-or-illness",
   "publisher": "Workplace Safety and Insurance Board",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_incidents",
   "title": "Reporting workplace incidents and illnesses",
   "url": "https://www.ontario.ca/page/reporting-workplace-incidents-and-illnesses",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_sup",
   "title": "Supervisor awareness training program (A guide to Occupational Health and Safety Act requirements for basic awareness training)",
   "url": "https://www.ontario.ca/document/guide-occupational-health-and-safety-act-requirements-basic-awareness-training/supervisor",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_cia",
   "title": "Notice – Corporations Information Act – Filing an Initial Return and Notice of Change – Ontario Corporations (effective February 1, 2025)",
   "url": "https://forms.mgcs.gov.on.ca/dataset/384d2ec2-48fe-4170-bbad-41cd7dcbe2d6/resource/fea48da9-9bf6-4ddc-a8c4-c5576244041e/download/on00230e.pdf",
   "publisher": "Government of Ontario (ServiceOntario)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_isc",
   "title": "Beneficial ownership information requirements",
   "url": "https://www.ontario.ca/page/beneficial-ownership-information-requirements",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_qc_obl",
   "title": "Legal Obligations Stemming from Registration",
   "url": "https://www.quebec.ca/en/businesses-and-self-employed-workers/start-entreprise/register-constitute-enterprise/learn-about-registration/obligations",
   "publisher": "Gouvernement du Québec (Registraire des entreprises)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_qc_lang",
   "title": "Obligations des commerces, des entreprises, des ordres professionnels et de l'Administration en matière de langue française",
   "url": "https://www.quebec.ca/culture/langue-francaise/exercer-droits-langue-francaise/obligations",
   "publisher": "Gouvernement du Québec",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_qc_cai",
   "title": "Incidents de confidentialité et mesures de sécurité",
   "url": "https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/incidents-confidentialite-mesures-securite-entreprises",
   "publisher": "Commission d'accès à l'information du Québec",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_qc_demes",
   "title": "Comprendre ses obligations en équité salariale",
   "url": "https://www.cnesst.gouv.qc.ca/fr/demarches-formulaires/employeurs/travaux-equite-salariale/comprendre-ses-obligations-en-equite-salariale",
   "publisher": "CNESST",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_bc_tr",
   "title": "Business Corporations Act, Part 4.1 — Transparency Register (consolidation current to November 3, 2026)",
   "url": "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02057_055",
   "publisher": "Government of British Columbia (BC Laws)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_bc_pay",
   "title": "Guidance for preparing pay transparency reports",
   "url": "https://www2.gov.bc.ca/gov/content/governments/about-the-bc-government/gender-equity/preparing-pay-transparency-reports",
   "publisher": "Government of British Columbia",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_bc_wca",
   "title": "Workers Compensation Act, Part 4: Compensation to Injured Workers and Their Dependants",
   "url": "https://www.worksafebc.com/en/law-policy/occupational-health-safety/searchable-ohs-regulation/workers-compensation-act/part-4-compensation-to-injured-workers-and-their-dependants",
   "publisher": "WorkSafeBC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_bc_jhsc",
   "title": "Joint health & safety committees and worker health & safety representatives",
   "url": "https://www.worksafebc.com/en/health-safety/create-manage/joint-health-safety-committees",
   "publisher": "WorkSafeBC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_bc_maint",
   "title": "Maintaining Your B.C. Company",
   "url": "https://www2.gov.bc.ca/assets/gov/employment-business-and-economic-development/business-management/permits-licences-and-registration/registries-guides/info_36_com_-_maintaining_your_bc_company.pdf",
   "publisher": "BC Registries and Online Services",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ab_oipc",
   "title": "Breach Notification Requirements (How to Notify the OIPC of a Privacy Breach)",
   "url": "https://oipc.ab.ca/breach-notification/",
   "publisher": "Office of the Information and Privacy Commissioner of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ab_wcb",
   "title": "My worker is injured…what do I do? (WCB-500)",
   "url": "https://www.wcb.ab.ca/assets/pdfs/employers/EFS_My_worker_is_injured.pdf",
   "publisher": "Workers' Compensation Board – Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ab_change",
   "title": "Change notices for corporations, cooperatives and organizations",
   "url": "https://www.alberta.ca/corporations-cooperatives-organizations-change-notices",
   "publisher": "Government of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_ab_up",
   "title": "Unclaimed property",
   "url": "https://www.alberta.ca/unclaimed-property",
   "publisher": "Government of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_src_on_cia_ep",
   "title": "Notice – Corporations Information Act – Filing an Initial Return and Notice of Change – Extra-Provincial Corporations (effective October 19, 2021)",
   "url": "https://forms.mgcs.gov.on.ca/dataset/963f3b12-ce06-488a-a4e2-cb245293708e/resource/37f707f8-b863-4b18-9c29-e408df6472f7/download/on00231e.pdf",
   "publisher": "Government of Ontario",
   "checked": "2026-11-12"
  },
  {
   "id": "ca_y_cra_latefile_ind",
   "title": "Late-filing penalty (individuals)",
   "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/interest-penalties/late-filing-penalty.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cra_dates_ind",
   "title": "Important dates for individuals",
   "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/important-dates-individuals.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cra_rrsp_limit",
   "title": "How contributions affect your RRSP deduction limit",
   "url": "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp/contributions-affect-your-rrsp-prpp-deduction-limit.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cra_baretrust_faq",
   "title": "Enhanced reporting rules for trusts and bare trusts: FAQ (updated October 5, 2026)",
   "url": "https://www.canada.ca/en/revenue-agency/services/tax/trust-administrators/t3-return/enhanced-reporting-rules-trusts-bare-trusts-faq.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cra_t4013",
   "title": "T3 Trust Guide – 2025 (T4013), Penalties and interest",
   "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4013/t3-trust-guide.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cra_gstmemo21",
   "title": "GST/HST Memorandum 2.1, Required registration (June 2026)",
   "url": "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/2-1/required-registration.html",
   "publisher": "Canada Revenue Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_bc_ctb005",
   "title": "Bulletin CTB 005, Penalties and Interest (revised February 2026)",
   "url": "https://www2.gov.bc.ca/assets/gov/taxes/sales-taxes/publications/ctb-005-penalties-interest.pdf",
   "publisher": "British Columbia Ministry of Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_sk_sets_home",
   "title": "Saskatchewan eTax Services (SETS) home page: Penalty Updates",
   "url": "https://sets.saskatchewan.ca/rptp/portal/home",
   "publisher": "Government of Saskatchewan, Ministry of Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_mb_tamta",
   "title": "The Tax Administration and Miscellaneous Taxes Act, C.C.S.M. c. T2 (current as of November 9, 2026)",
   "url": "https://web2.gov.mb.ca/laws/statutes/ccsm/t002.php?lang=en",
   "publisher": "Manitoba Laws (Government of Manitoba)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_mb_he001",
   "title": "Health and Post Secondary Education Tax Levy Bulletin No. 001, Information for Employers (revised January 2026)",
   "url": "https://www.gov.mb.ca/finance/taxation/pubs/bulletins/001he.pdf",
   "publisher": "Manitoba Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_bc_eht_pen",
   "title": "Penalties and interest for employer health tax (last updated June 17, 2026)",
   "url": "https://www2.gov.bc.ca/gov/content/taxes/employer-health-tax/employer-health-tax-overview/eht-file-pay/penalties-interest",
   "publisher": "Government of British Columbia, Ministry of Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_wsbc_pen",
   "title": "Assessment penalties",
   "url": "https://www.worksafebc.com/en/insurance/manage-account/report-payroll-pay-premiums/assessment-penalties",
   "publisher": "WorkSafeBC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cbca_113",
   "title": "Canada Business Corporations Act, section 113 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/C-44/section-113.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cbca_212",
   "title": "Canada Business Corporations Act, section 212 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/C-44/section-212.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_cbca_251",
   "title": "Canada Business Corporations Act, section 251 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/C-44/section-251.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_nfp_info_ar",
   "title": "Information on annual return filings for not-for-profit corporations",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/not-profit-corporations/information-annual-return-filings-not-profit-corporations",
   "publisher": "Corporations Canada (Innovation, Science and Economic Development Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_nfp_ar",
   "title": "Annual return (not-for-profit corporations)",
   "url": "https://ised-isde.canada.ca/site/corporations-canada/en/annual-return-not-profit-corporations",
   "publisher": "Corporations Canada (Innovation, Science and Economic Development Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_eea_36",
   "title": "Employment Equity Act, section 36 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/E-5.401/section-36.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_casl_20",
   "title": "An Act to promote the efficiency and adaptability of the Canadian economy ... (CASL), section 20 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/E-1.6/section-20.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_pcmltfa_75",
   "title": "Proceeds of Crime (Money Laundering) and Terrorist Financing Act, section 75 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/P-24.501/section-75.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_pcmltfa_77",
   "title": "Proceeds of Crime (Money Laundering) and Terrorist Financing Act, section 77 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/P-24.501/section-77.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_ica_40",
   "title": "Investment Canada Act, section 40 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/I-21.8/section-40.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_tm_46",
   "title": "Trademarks Act, section 46 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/T-13/section-46.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_ffl_19",
   "title": "Fighting Against Forced Labour and Child Labour in Supply Chains Act, section 19 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/F-10.6/section-19.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_stat_31",
   "title": "Statistics Act, section 31 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/S-19/section-31.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_gaz_npri",
   "title": "Notice with respect to the substances in the National Pollutant Release Inventory for 2025, 2026 and 2027 (Canada Gazette, Part I, Vol. 159, No. 10, Supplement, March 8, 2025)",
   "url": "https://gazette.gc.ca/rp-pr/p1/2025/2025-03-08/html/sup1-eng.html",
   "publisher": "Canada Gazette (Government of Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_clc_148",
   "title": "Canada Labour Code, section 148 (current to 2026-10-19)",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/L-2/section-148.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_on_esa_role",
   "title": "Your guide to the Employment Standards Act: Role of the ministry (updated September 16, 2026)",
   "url": "https://www.ontario.ca/document/your-guide-employment-standards-act-0/role-ministry",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_on_ohsa_ix",
   "title": "Guide to the Occupational Health and Safety Act, Part IX: Offences and penalties (updated March 24, 2025)",
   "url": "https://www.ontario.ca/document/guide-occupational-health-and-safety-act/part-ix-offences-and-penalties",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_on_obca",
   "title": "Business Corporations Act, R.S.O. 1990, c. B.16 (e-Laws, consolidated from October 1, 2025)",
   "url": "https://www.ontario.ca/laws/statute/90b16",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_on_bna",
   "title": "Business Names Act, R.S.O. 1990, c. B.17 (e-Laws, consolidated from October 19, 2021)",
   "url": "https://www.ontario.ca/laws/statute/90b17",
   "publisher": "Government of Ontario",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_qc_news_2026",
   "title": "SAISON DES IMPÔTS - Plus de 94 % des déclarations déjà transmises électroniquement (Revenu Québec news release, April 1, 2026)",
   "url": "https://www.quebec.ca/nouvelles/actualites/details/saison-des-impots-plus-de-94-des-declarations-deja-transmises-electroniquement-69528",
   "publisher": "Gouvernement du Québec (Québec.ca, Revenu Québec release)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_qc_req_sanctions",
   "title": "Civil and Penal Sanctions Stemming from Registration (last update October 5, 2023)",
   "url": "https://www.quebec.ca/en/businesses-and-self-employed-workers/start-entreprise/register-constitute-enterprise/learn-about-registration/civil-penal-sanctions",
   "publisher": "Gouvernement du Québec (Québec.ca, Registraire des entreprises)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_qc_charte_conf",
   "title": "Conformité des entreprises à la Charte de la langue française pour la validation d'une offre d'emploi (mise à jour 17 décembre 2025)",
   "url": "https://www.quebec.ca/entreprises-et-travailleurs-autonomes/administrer-gerer/embauche-gestion-personnel/recruter/embaucher-immigrant/embaucher-travailleur-etranger-permanent/conditions-validation-emploi-permanent-travailleur-qualifie/conformite-entreprises-charte-langue-francaise-validation-emploi",
   "publisher": "Gouvernement du Québec (Québec.ca)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_sk_ar",
   "title": "Maintaining a business corporation",
   "url": "https://www.saskregistries.ca/corporateregistry/maintainandamendyourbusinessinformation/maintainingabusinesscorporation",
   "publisher": "Information Services Corporation (Saskatchewan Corporate Registry)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_ns_rg_2026_09_16",
   "title": "Royal Gazette Part I, Vol. 235, September 16, 2026: Certificates Revoked for Non-Payment (Corporations Registration Act, s.7)",
   "url": "https://novascotia.ca/just/regulations/rg1/RG1-2026-09-16.pdf",
   "publisher": "Province of Nova Scotia (Royal Gazette)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_nt_corp",
   "title": "NWT corporations",
   "url": "https://gnwt.ca/business-and-economy/business-licences-taxes-and-regulations/business-names-and-partnerships/nwt-corporations?justice=en",
   "publisher": "Government of the Northwest Territories, Department of Justice (Corporate Registries)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_nt_bca",
   "title": "Business Corporations Act, S.N.W.T. 1996, c.19 (consolidation, amended to S.N.W.T. 2025, c.2)",
   "url": "https://gnwt.ca/sites/default/files/legacy_justice/files/legislation/business-corporations/business-corporations.a.pdf",
   "publisher": "Government of the Northwest Territories (Territorial Printer)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_nu_bca",
   "title": "Consolidation of Business Corporations Act, S.N.W.T. 1996, c.19 (Nunavut), current to 2015-02-01",
   "url": "https://www.nunavutlegislation.ca/en/file-download/download/public/617",
   "publisher": "Nunavut Legislation (Government of Nunavut)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_bc_bca_p13",
   "title": "Business Corporations Act [SBC 2002] c. 57, Part 13 (sections 426-428), current to November 3, 2026",
   "url": "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/02057_13",
   "publisher": "BC Laws (King's Printer, British Columbia)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_bc_pta",
   "title": "Pay Transparency Act [SBC 2023] c. 18, current to November 3, 2026",
   "url": "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/23018",
   "publisher": "BC Laws (King's Printer, British Columbia)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_wsbc_admpen",
   "title": "Media Backgrounder: Administrative Penalties (March 2026)",
   "url": "https://www.worksafebc.com/~/media/4621A11AA91E4FE8A833DF42BEFCC591.ashx?dt=202411140603",
   "publisher": "WorkSafeBC",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_wcbab_pol0105",
   "title": "Policy 01-05 Part II Application 2: Employer Recording and Reporting of Accidents (issue date April 1, 2021)",
   "url": "https://www.wcb.ab.ca/assets/pdfs/public/policy/manual/printable_pdfs/0105_2_app2.pdf",
   "publisher": "Workers' Compensation Board – Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_y_ab_pipa",
   "title": "Personal Information Protection Act, SA 2003, c. P-6.5 (current as of September 1, 2025)",
   "url": "https://kings-printer.alberta.ca/documents/Acts/P06P5.pdf",
   "publisher": "Alberta King's Printer",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_passport_online",
   "title": "Renew online",
   "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/renew-adult-passport/submit-form-fees/renew-online.html",
   "publisher": "Immigration, Refugees and Citizenship Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_prcard",
   "title": "Get, renew or replace a permanent resident card",
   "url": "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/application-renew-replace-permanent-resident-card.html",
   "publisher": "Immigration, Refugees and Citizenship Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_prcard_faq",
   "title": "Help Centre: Permanent resident card - Applying, renewing, replacing",
   "url": "https://ircc.canada.ca/english/helpcentre/questions-answers-by-topic.asp?st=10.1",
   "publisher": "Immigration, Refugees and Citizenship Canada",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_on_dl",
   "title": "Renew an expired driver's licence",
   "url": "https://www.ontario.ca/page/renew-expired-drivers-licence",
   "publisher": "Government of Ontario (Ministry of Transportation / ServiceOntario)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_on_addr",
   "title": "Change your address on your driver's licence, vehicle permit and health card",
   "url": "https://www.ontario.ca/page/change-address-drivers-licence-vehicle-permit-and-health-card",
   "publisher": "Government of Ontario (ServiceOntario)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_on_plate",
   "title": "Licence plate renewals",
   "url": "https://www.ontario.ca/page/licence-plate-renewals",
   "publisher": "Government of Ontario (ServiceOntario)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_on_health",
   "title": "Renew your health card",
   "url": "https://www.ontario.ca/page/health-card-renewal",
   "publisher": "Government of Ontario (ServiceOntario)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_bc_seniors",
   "title": "Senior drivers",
   "url": "https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/roadsafetybc/medical-fitness/seniors",
   "publisher": "Government of British Columbia (RoadSafetyBC)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_bc_card",
   "title": "Renew or replace a card (BC Services Card)",
   "url": "https://www2.gov.bc.ca/gov/content/governments/government-id/bc-services-card/your-card/replace-renew-card",
   "publisher": "Government of British Columbia",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_bc_msp_move",
   "title": "Moving within B.C. (Medical Services Plan)",
   "url": "https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/msp/bc-residents/managing-your-msp-account/moving-within-bc",
   "publisher": "Government of British Columbia (Health Insurance BC)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_icbc_uninsured",
   "title": "ICBC news release: uninsured drivers (June 12, 2024)",
   "url": "https://icbc.com/pa/about-icbc/newsroom/2024-jun12-uninsured-drivers",
   "publisher": "Insurance Corporation of British Columbia (ICBC)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_qc_lic",
   "title": "Renewing and Paying Your Driver's Licence",
   "url": "https://saaq.gouv.qc.ca/en/drivers-licences/renewing-drivers-licence",
   "publisher": "Société de l'assurance automobile du Québec (SAAQ)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_qc_reg",
   "title": "Renewing a vehicle registration",
   "url": "https://saaq.gouv.qc.ca/en/vehicle-registration/renewal",
   "publisher": "Société de l'assurance automobile du Québec (SAAQ)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_ab_faq",
   "title": "Frequently Asked Questions (Alberta eServices)",
   "url": "https://eservices.alberta.ca/common-questions",
   "publisher": "Government of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_ab_reg",
   "title": "Vehicle registration renewal",
   "url": "https://www.alberta.ca/vehicle-registration-renewal",
   "publisher": "Government of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_ab_update",
   "title": "Update driving documents",
   "url": "https://www.alberta.ca/update-driving-documents",
   "publisher": "Government of Alberta",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_fa64",
   "title": "Firearms Act (S.C. 1995, c. 39), section 64: Term",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/f-11.6/page-5.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_nexus",
   "title": "Apply for, renew or replace a NEXUS card: Renew or replace",
   "url": "https://www.cbsa-asfc.gc.ca/services/travel-voyage/prog/nexus/nexus-6-eng.html",
   "publisher": "Canada Border Services Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_aigpdr",
   "title": "Accounting for Imported Goods and Payment of Duties Regulations (SOR/86-1062)",
   "url": "https://laws-lois.justice.gc.ca/eng/regulations/SOR-86-1062/FullText.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_carm_sched",
   "title": "CARM: Features and benefits (billing and payment schedule)",
   "url": "https://www.canada.ca/en/border-services-agency/services/carm/schedule.html",
   "publisher": "Canada Border Services Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_customs_act",
   "title": "Customs Act (R.S.C. 1985, c. 1 (2nd Supp.))",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/c-52.6/FullText.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_d17121",
   "title": "Memorandum D17-1-21: Maintenance of records in Canada by importers",
   "url": "https://www.cbsa-asfc.gc.ca/publications/dm-md/d17/d17-1-21-eng.html",
   "publisher": "Canada Border Services Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_d2011",
   "title": "Memorandum D20-1-1: Exporter reporting",
   "url": "https://www.cbsa-asfc.gc.ca/publications/dm-md/d20/d20-1-1-eng.html",
   "publisher": "Canada Border Services Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_eprr",
   "title": "Exporters' and Producers' Records Regulations (SOR/97-71)",
   "url": "https://laws-lois.justice.gc.ca/eng/regulations/SOR-97-71/FullText.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_bc_upa",
   "title": "Unclaimed Property Act [SBC 1999] c. 48",
   "url": "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/99048_01",
   "publisher": "BC Laws (King's Printer, Government of British Columbia)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_qc_ufa",
   "title": "Changes to the Deadline for Remitting Unclaimed Financial Assets",
   "url": "https://www.revenuquebec.ca/en/unclaimed-property/remit-property/changes-to-the-deadline-for-remitting-unclaimed-financial-assets/",
   "publisher": "Revenu Québec",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_patent_act",
   "title": "Patent Act (R.S.C. 1985, c. P-4), sections 27.1 and 46",
   "url": "https://laws-lois.justice.gc.ca/eng/acts/p-4/FullText.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_idr",
   "title": "Industrial Design Regulations (SOR/2018-120), section 33",
   "url": "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-120/FullText.html",
   "publisher": "Justice Laws Website (Department of Justice Canada)",
   "checked": "2026-11-11"
  },
  {
   "id": "ca_x_g_src_fcp",
   "title": "Federal Contractors Program",
   "url": "https://www.canada.ca/en/employment-social-development/programs/employment-equity/federal-contractor-program.html",
   "publisher": "Employment and Social Development Canada (Labour Program)",
   "checked": "2026-11-11"
  }
 ],
 "patches": {
  "ca_t1_nr": {
   "penalty": "Late-filing penalty: 5% of the balance owing plus 1% of the balance owing for each full month the return is late, up to 12 months (2025 return). If you were also penalized for 2022, 2023 or 2024 and got a demand to file: 10% plus 2% per full month, up to 20 months. Compound daily interest on any unpaid amount from the day after the due date.",
   "penaltySource": "ca_y_cra_latefile_ind",
   "note": "The CRA page is the general page for individuals' returns; Income Tax Act s.162(1) (Justice Laws, current to 2026-10-19) applies the same 5% + 1%/month rule to every person who fails to file a return of income as required by s.150(1), which includes non-resident individuals filing a T1."
  },
  "ca_tp1": {
   "penalty": "A late-filing penalty and interest apply if the return is late and a balance is owing; paying any balance by April 30 avoids them. (The amount of the penalty was not read on an official page.)",
   "penaltySource": "ca_y_qc_news_2026",
   "verified": true,
   "source": "ca_y_qc_news_2026",
   "note": "Penalty figures not read: revenuquebec.ca refused automated access earlier (not retried, per instructions) and LégisQuébec (legisquebec.gouv.qc.ca) returned 403 'Request blocked' on 2026-11-11; no Québec.ca page found states the figures. The Revenu Québec release of April 1, 2026 says only that the balance must be paid by April 30, 2026 to avoid a late-filing penalty and interest."
  },
  "ca_tp1_se": {
   "penalty": "A late-filing penalty and interest apply if a balance is not paid by April 30, even though the return itself is due June 15. (The amount of the penalty was not read on an official page.)",
   "penaltySource": "ca_y_qc_news_2026",
   "verified": true,
   "source": "ca_y_qc_news_2026",
   "note": "Penalty figures not read: revenuquebec.ca refused automated access earlier (not retried, per instructions) and LégisQuébec (legisquebec.gouv.qc.ca) returned 403 'Request blocked' on 2026-11-11; no Québec.ca page found states the figures. The Revenu Québec release of April 1, 2026 says only that the balance must be paid by April 30, 2026 to avoid a late-filing penalty and interest."
  },
  "ca_rrsp": {
   "penalty": "No penalty as such: a contribution made after the deadline cannot be deducted on that year's return (for 2025, only contributions made from March 4, 2025 to March 2, 2026 qualify). Separately, contributions over the deduction limit by more than $2,000 are taxed at 1% per month.",
   "penaltySource": "ca_y_cra_rrsp_limit",
   "verified": true,
   "source": "ca_y_cra_dates_ind",
   "note": "The 60-days-after-year-end rule gives March 1, 2027 for the 2026 year; the CRA had not yet published the 2026-year date on the page read (2026-09-17)."
  },
  "ca_bare_trust": {
   "penalty": "Late filing: $25 a day for as long as the failure continues, minimum $100, maximum $2,500 (s.162(7)). A trust that is not a listed trust and knowingly or by gross negligence fails to file or makes a false statement: the greater of $2,500 and 5% of the highest fair market value of the trust's property in the year. Where tax is unpaid, the T3 late-filing penalty is 5% of the unpaid tax plus 1% per full month late, up to 12 months.",
   "penaltySource": "ca_y_cra_baretrust_faq"
  },
  "ca_npo_t3": {
   "penalty": "Failure to file a T3 return: 5% of the unpaid tax when the return was due, plus 1% of that unpaid tax for each full month late, up to 12 months (10% plus 2% per month up to 20 months after a demand and a penalty in any of the 3 preceding years). A trust with no unpaid tax pays a daily penalty from a minimum of $100 to a maximum of $2,500 ($25 a day). Compound daily interest on unpaid amounts and penalties.",
   "penaltySource": "ca_y_cra_t4013",
   "note": "The $25-a-day rate for a trust with no unpaid tax is stated on the CRA bare trust FAQ and in ITA s.162(7)."
  },
  "ca_gst_register": {
   "penalty": "No separate late-registration penalty is stated. Registration is backdated: the effective date is the day you were required to be registered, so GST/HST is owed on taxable sales from that date (the person who makes a taxable supply must collect the tax, ETA s.221(1)). A late application must include supporting records, and if you do not apply the CRA may send a notice of intent and register you 60 days later.",
   "penaltySource": "ca_y_cra_gstmemo21"
  },
  "ca_bc_pst_m": {
   "penalty": "Failure to file: 5% of the tax not paid when the return was due plus 1% of it for each complete month late, up to 12 months; a late or short payment adds a 10% penalty. Repeated late filing: 10% plus 2% per month, up to 20 months. Interest is charged on late payments, compounded monthly. A first late return within 12 months (24 for annual filers) with a good history usually gets a warning letter instead of a penalty, but the commission may be denied.",
   "penaltySource": "ca_y_bc_ctb005"
  },
  "ca_bc_pst_q": {
   "penalty": "Failure to file: 5% of the tax not paid when the return was due plus 1% of it for each complete month late, up to 12 months; a late or short payment adds a 10% penalty. Repeated late filing: 10% plus 2% per month, up to 20 months. Interest is charged on late payments, compounded monthly. A first late return within 12 months with a good history usually gets a warning letter instead of a penalty, but the commission may be denied.",
   "penaltySource": "ca_y_bc_ctb005"
  },
  "ca_bc_pst_a": {
   "penalty": "Failure to file: 5% of the tax not paid when the return was due plus 1% of it for each complete month late, up to 12 months; a late or short payment adds a 10% penalty. Repeated late filing: 10% plus 2% per month, up to 20 months. Interest is charged on late payments, compounded monthly. A first late return within 24 months (annual filers) with a good history usually gets a warning letter instead of a penalty, but the commission may be denied.",
   "penaltySource": "ca_y_bc_ctb005"
  },
  "ca_sk_pst_m": {
   "penalty": "From October 1, 2024: a $50 penalty for each return period not filed by the due date (including nil returns), plus a 10% penalty on tax not paid by the due date, with no maximum (the former $500 cap per return period was removed). Penalty and interest are charged on late returns and payments; the detailed rules are in Information Bulletin GENERAL-1.",
   "penaltySource": "ca_y_sk_sets_home",
   "note": "Read on the SETS home page notice ('Penalty Updates', 2024/25 Budget) for Saskatchewan's tax programs filed through SETS; Information Bulletin GENERAL-1 itself (publications.saskatchewan.ca) returned HTTP 503 and a certificate error and was not read, so the interest rate is not given here."
  },
  "ca_sk_pst_q": {
   "penalty": "From October 1, 2024: a $50 penalty for each return period not filed by the due date (including nil returns), plus a 10% penalty on tax not paid by the due date, with no maximum (the former $500 cap per return period was removed). Penalty and interest are charged on late returns and payments; the detailed rules are in Information Bulletin GENERAL-1.",
   "penaltySource": "ca_y_sk_sets_home"
  },
  "ca_sk_pst_a": {
   "penalty": "From October 1, 2024: a $50 penalty for each return period not filed by the due date (including nil returns), plus a 10% penalty on tax not paid by the due date, with no maximum (the former $500 cap per return period was removed). Penalty and interest are charged on late returns and payments; the detailed rules are in Information Bulletin GENERAL-1.",
   "penaltySource": "ca_y_sk_sets_home",
   "note": "Read on the SETS home page notice ('Penalty Updates', 2024/25 Budget) for Saskatchewan's tax programs filed through SETS; Information Bulletin GENERAL-1 itself (publications.saskatchewan.ca) returned HTTP 503 and a certificate error and was not read, so the interest rate is not given here."
  },
  "ca_mb_rst_m": {
   "penalty": "A penalty of 10% of the tax not paid or remitted by the due date (returns received after 4:30 p.m. on the due date are late); if the tax was refused or unpaid through neglect or carelessness, the director may impose up to 100% of the unpaid tax. The tax debt and the penalty bear interest, compounded monthly, from the day the tax was due.",
   "penaltySource": "ca_y_mb_tamta"
  },
  "ca_mb_rst_q": {
   "penalty": "A penalty of 10% of the tax not paid or remitted by the due date (returns received after 4:30 p.m. on the due date are late); if the tax was refused or unpaid through neglect or carelessness, the director may impose up to 100% of the unpaid tax. The tax debt and the penalty bear interest, compounded monthly, from the day the tax was due.",
   "penaltySource": "ca_y_mb_tamta"
  },
  "ca_mb_rst_a": {
   "penalty": "A penalty of 10% of the tax not paid or remitted by the due date (returns received after 4:30 p.m. on the due date are late); if the tax was refused or unpaid through neglect or carelessness, the director may impose up to 100% of the unpaid tax. The tax debt and the penalty bear interest, compounded monthly, from the day the tax was due.",
   "penaltySource": "ca_y_mb_tamta"
  },
  "ca_bc_eht": {
   "penalty": "Late filing penalty if the return is not filed and the tax paid by the due date: 5% of the balance owing on the due date plus 1% of it for each complete month late, up to 12 months. Repeated failure (after a written demand, with late filing penalties in any of the 3 previous calendar years): 10% plus 2% per month, up to 20 months. Interest at prime plus 3% on late payments of the balance owing.",
   "penaltySource": "ca_y_bc_eht_pen"
  },
  "ca_bc_eht_inst": {
   "penalty": "Interest, not a penalty: missed or deficient instalments are charged interest at prime plus 3% from the instalment due date (instalments are underpaid if they are less than the actual tax for both the current and the previous year).",
   "penaltySource": "ca_y_bc_eht_pen"
  },
  "ca_mb_he_a": {
   "penalty": "A penalty of 10% of any balance of tax not paid by the due date (also on tax paid with the annual report that should have been remitted on an earlier monthly return); failing to file a required return by the due date may bring a penalty of up to $200 for each day the failure continues. Interest runs from the date payment was due, at the prime lending rate given to the province plus 3%, reset every January 1 and July 1.",
   "penaltySource": "ca_y_mb_he001"
  },
  "ca_worksafebc": {
   "penalty": "A penalty based on the amount of premiums for not reporting payroll or not paying premiums by the due date, minimum $50. Unpaid balances carry a 1% monthly overdue penalty, and collection action may follow. Under-reporting payroll or under-paying premiums: a penalty of 8% may be charged. Not registering when required: retroactive premiums and possibly the total cost of claims while unregistered.",
   "penaltySource": "ca_y_wsbc_pen"
  },
  "ca_corpcan_nfp": {
   "penalty": "The corporation may be dissolved. The law allows dissolution after one year of non-filing, but Corporations Canada's policy is to dissolve a not-for-profit corporation only when it has not filed for three years, after a final notice giving another 120 days to file. Failing to comply with the Act is also an offence: a fine of up to $5,000 or up to six months' imprisonment, or both, on summary conviction (NFP Act s.262(1)).",
   "penaltySource": "ca_y_nfp_info_ar",
   "verified": true,
   "source": "ca_y_nfp_ar",
   "note": null
  },
  "ca_ar_sk": {
   "penalty": "A late annual return costs $110 instead of $60 (for-profit corporation, fees effective April 15, 2026). A final notice is sent about two weeks after the due date; if the annual return is not received within 30 days of the final notice, the corporation is struck from the registry.",
   "penaltySource": "ca_y_sk_ar"
  },
  "ca_ar_ns": {
   "penalty": "If the annual renewal fee is not paid by the date required, the Registrar revokes the Certificate of Registration and the status becomes 'revoked for non-payment'; revocations are published in the Royal Gazette.",
   "penaltySource": "ca_y_ns_rg_2026_09_16",
   "note": "The Registry's page on revocation states the same rule in general terms: 'If ... you don't pay your renewal fee by the date required, the registry revokes (cancels) your Certificate of Registration and changes the status of the registration to revoked for non-payment' (ca_y_ns_revoke_name)."
  },
  "ca_ar_nt": {
   "penalty": "If the Registrar does not receive a notice or document required by the Act within one year after it is due, the Registrar may dissolve the corporation, after giving 60 days' notice. Contravening a provision for which no penalty is provided, without reasonable cause, is an offence: up to $10,000 for a body corporate and up to $5,000 for an individual.",
   "penaltySource": "ca_y_nt_bca",
   "verified": true,
   "source": "ca_y_nt_corp",
   "note": "The Act (s.270(2)) states the same rule: 'on or before the last day of the month immediately following its anniversary month'. Annual return fee $150 (NWT Corporations fee schedule). General offence: s.253; the s.299 'general penalty' of $10,000 applies only to Part XXI, not to the annual return."
  },
  "ca_ar_nu": {
   "penalty": "If the Registrar does not receive a notice or document required by the Act within one year after it is due, the Registrar may dissolve the corporation after 60 days' notice. Contravening a provision for which no penalty is provided, without reasonable cause, is an offence: up to $10,000 for a body corporate and up to $5,000 for an individual.",
   "penaltySource": "ca_y_nu_bca",
   "dueText": "On or before the last day of the month immediately following the anniversary month (the month in which the corporation was incorporated or amalgamated).",
   "due": {
    "t": "anniversary",
    "of": "ca_inc_date",
    "monthEnd": true,
    "months": 1
   },
   "source": "ca_y_nu_bca",
   "note": "Read in the Nunavut consolidation of the Business Corporations Act on nunavutlegislation.ca, which is stated as current to 2015-02-01; later amendments, if any, were not checked. The same rule is in the NWT Act and on the NWT registry page."
  },
  "ca_on_bizname": {
   "penalty": "A registration not renewed within 60 days after it expires lapses. Carrying on business under an unregistered name is an offence: a fine of up to $2,000, or up to $25,000 for a corporation (directors and officers who acquiesced: up to $2,000). The business also cannot bring a court proceeding in Ontario in connection with that business without the court's leave (contracts remain valid).",
   "penaltySource": "ca_y_on_bna",
   "note": "Business Names Act s.5(2): 'A registrant is entitled to renew a registration within sixty days after it expires upon paying the required fee for late renewal.'"
  },
  "ca_x_cbca_directors": {
   "penalty": "No fine is set for this notice in the Act. Any interested person or the Director may ask a court to order the corporation to comply; a corporation in default for one year in sending any required notice to the Director may be dissolved by the Director (after 120 days' notice); and contravening a provision for which no punishment is provided, without reasonable cause, is an offence punishable on summary conviction.",
   "penaltySource": "ca_y_cbca_113",
   "note": "Dissolution ground: CBCA s.212(1)(a)(iii) 'in default for a period of one year in sending to the Director any fee or any notice'; offence: s.251. The Act states no fine amount for s.251."
  },
  "ca_x_cbca_office": {
   "penalty": "No fine is set for this notice in the Act. A corporation in default for one year in sending any required notice to the Director may be dissolved by the Director (after 120 days' notice), and contravening a provision for which no punishment is provided, without reasonable cause, is an offence punishable on summary conviction.",
   "penaltySource": "ca_y_cbca_212",
   "note": "CBCA s.19(4) (current to 2026-10-19) confirms the 15-day rule. Offence: s.251, which states no fine amount."
  },
  "ca_x_cbca_agm": {
   "penalty": "No specific penalty is set. Contravening a provision of the Act for which no punishment is provided, without reasonable cause, is an offence punishable on summary conviction (no amount stated in the Act). The corporation may instead apply to the court for an order extending the time for calling the annual meeting.",
   "penaltySource": "ca_y_cbca_251"
  },
  "ca_x_ee": {
   "penalty": "Failing without reasonable excuse to file the employment equity report, leaving out required information, or knowingly giving false information is a violation (not an offence) for which the Minister may assess a monetary penalty of up to $10,000 for a single violation and up to $50,000 for repeated or continued violations; each day a violation continues is a separate violation.",
   "penaltySource": "ca_y_eea_36",
   "note": "Violation defined in Employment Equity Act s.35(1)(a) (failing to file the s.18 report); s.18(1) confirms the June 1 deadline for the immediately preceding calendar year."
  },
  "ca_x_eahor": {
   "penalty": "Contravening a provision of Part II of the Canada Labour Code, which includes the employer's duty to investigate, record and report accidents, occurrences of harassment and violence, occupational illnesses and other hazardous occurrences in accordance with the regulations, is an offence: up to $100,000 on summary conviction, or up to $1,000,000 on indictment (no imprisonment for a contravention of paragraph 125(1)(c)).",
   "penaltySource": "ca_y_clc_148",
   "note": "The reporting duty is Canada Labour Code s.125(1)(c) ('investigate, record and report, in accordance with the regulations, all accidents, occurrences of harassment and violence ...'); s.148(4) rules out imprisonment for 125(1)(c). The annual report itself is set by regulation, which was not read; administrative monetary penalties under Part IV of the Code were not checked."
  },
  "ca_x_eahvor": {
   "penalty": "Contravening a provision of Part II of the Canada Labour Code, which includes the employer's duty to investigate, record and report accidents, occurrences of harassment and violence, occupational illnesses and other hazardous occurrences in accordance with the regulations, is an offence: up to $100,000 on summary conviction, or up to $1,000,000 on indictment (no imprisonment for a contravention of paragraph 125(1)(c)).",
   "penaltySource": "ca_y_clc_148",
   "note": "The reporting duty is Canada Labour Code s.125(1)(c) ('investigate, record and report, in accordance with the regulations, all accidents, occurrences of harassment and violence ...'); s.148(4) rules out imprisonment for 125(1)(c). The annual report itself is set by regulation, which was not read; administrative monetary penalties under Part IV of the Code were not checked."
  },
  "ca_x_casl": {
   "penalty": "Sending a commercial electronic message without consent or without the required identification, contact information and unsubscribe mechanism is a violation carrying an administrative monetary penalty of up to $1,000,000 for an individual and $10,000,000 for any other person.",
   "penaltySource": "ca_y_casl_20",
   "note": "Section 6(2)-(3) (current to 2026-10-19) contains the identification, contact information (valid 60 days) and unsubscribe-mechanism requirements; the 10-business-day rule for giving effect to an unsubscribe request is in s.11, which s.20 does not list by number."
  },
  "ca_x_fintrac_str": {
   "penalty": "Failing to report a suspicious transaction (PCMLTFA s.7) is an offence: on summary conviction a fine of up to $10,000,000 or up to two years less a day in prison, or both; on indictment a fine of up to $20,000,000 or up to five years, or both. FINTRAC may instead impose an administrative monetary penalty, up to $4,000,000 per violation for a person and $20,000,000 for an entity.",
   "penaltySource": "ca_y_pcmltfa_75"
  },
  "ca_x_fintrac_eft": {
   "penalty": "Failing to report a prescribed transaction (PCMLTFA s.9(1)) is an offence liable on summary conviction to a fine of up to $10,000,000. FINTRAC may instead impose an administrative monetary penalty, up to $4,000,000 per violation for a person and $20,000,000 for an entity.",
   "penaltySource": "ca_y_pcmltfa_77"
  },
  "ca_x_ica_notice": {
   "penalty": "If the Minister believes a non-Canadian has failed to give a required notice, the Minister may send a demand; if it is not complied with, a superior court may order, among other things, divestiture, suspension of voting rights, and a penalty of up to $10,000 for each day the non-Canadian is in contravention of the Act.",
   "penaltySource": "ca_y_ica_40",
   "note": "Ministerial demand for failing to give a notice under s.12: Investment Canada Act s.39(1)(a)."
  },
  "ca_x_tm_renew": {
   "penalty": "If the renewal fee is not paid within the prescribed period (after the Registrar's notice), the Registrar expunges the registration, which is deemed expunged at the expiry of the initial or last renewal period. The Registrar may not extend the period by more than seven days.",
   "penaltySource": "ca_y_tm_46"
  },
  "ca_x_supply_chain": {
   "penalty": "Failing to report as required by section 11 is an offence punishable on summary conviction with a fine of up to $250,000; knowingly giving false or misleading information carries the same maximum.",
   "penaltySource": "ca_y_ffl_19",
   "note": null
  },
  "ca_x_statcan": {
   "penalty": "Refusing or neglecting without lawful excuse to provide requested information, or to provide it when and as required, is an offence with a fine of up to $500 on summary conviction (the same for knowingly giving false information).",
   "penaltySource": "ca_y_stat_31",
   "note": null
  },
  "ca_x_npri": {
   "penalty": "Failing to comply with the notice is an offence under CEPA s.272.1: for a first offence, fines up to $100,000 for an individual and $500,000 for a corporation (on indictment; on summary conviction up to $25,000 for an individual and $250,000 for a corporation other than a small revenue corporation); doubled for a second or subsequent offence. Knowingly giving false or misleading information falls under s.272, with fines up to $1,000,000 for an individual and $6,000,000 for a corporation for a first offence.",
   "penaltySource": "ca_y_gaz_npri",
   "note": "The Gazette notice also confirms the deadlines: 2025 data by June 1, 2026; 2026 by June 1, 2027; 2027 by June 1, 2028. Summary-conviction amounts read in CEPA s.272.1(2)-(4), Justice Laws, current to 2026-10-19."
  },
  "ca_x_on_poster": {
   "penalty": "An employment standards officer can issue a notice of contravention for the poster requirement: $250 for a first contravention, $500 for a second within three years, $5,000 for a third within three years. A ticket (set fine $295 plus surcharge and costs) or prosecution is also possible; on conviction a corporation can be fined up to $100,000 (first), $250,000 (second) or $500,000 (third or later), an individual up to $100,000 and/or 12 months.",
   "penaltySource": "ca_y_on_esa_role"
  },
  "ca_x_on_disconnect": {
   "penalty": "A notice of contravention for any other ESA provision: $250 for a first contravention, $500 for a second within three years, $5,000 for a third within three years, each multiplied by the number of employees affected. Prosecution is also possible: a corporation up to $100,000 for a first conviction, $250,000 for a second and $500,000 for a third or later; an individual up to $100,000 and/or 12 months.",
   "penaltySource": "ca_y_on_esa_role"
  },
  "ca_x_on_emon": {
   "penalty": "A notice of contravention for any other ESA provision: $250 for a first contravention, $500 for a second within three years, $5,000 for a third within three years, each multiplied by the number of employees affected. Prosecution is also possible: a corporation up to $100,000 for a first conviction, $250,000 for a second and $500,000 for a third or later; an individual up to $100,000 and/or 12 months.",
   "penaltySource": "ca_y_on_esa_role"
  },
  "ca_x_on_critical": {
   "penalty": "Prosecution under the Occupational Health and Safety Act for a contravention of the Act or regulations: a fine of up to $2,000,000 for a corporation; up to $1,500,000 and/or 12 months' imprisonment for directors and officers; up to $500,000 and/or 12 months for any other person. A corporation's second or later offence causing death or serious injury within two years carries a minimum fine of $500,000.",
   "penaltySource": "ca_y_on_ohsa_ix",
   "note": null
  },
  "ca_x_on_jhsc": {
   "penalty": "Prosecution under the Occupational Health and Safety Act for a contravention of the Act or regulations: a fine of up to $2,000,000 for a corporation; up to $1,500,000 and/or 12 months' imprisonment for directors and officers; up to $500,000 and/or 12 months for any other person. A corporation's second or later offence causing death or serious injury within two years carries a minimum fine of $500,000.",
   "penaltySource": "ca_y_on_ohsa_ix",
   "note": null
  },
  "ca_x_on_policy_review": {
   "penalty": "Prosecution under the Occupational Health and Safety Act for a contravention of the Act or regulations: a fine of up to $2,000,000 for a corporation; up to $1,500,000 and/or 12 months' imprisonment for directors and officers; up to $500,000 and/or 12 months for any other person. A corporation's second or later offence causing death or serious injury within two years carries a minimum fine of $500,000.",
   "penaltySource": "ca_y_on_ohsa_ix"
  },
  "ca_x_on_supervisor": {
   "penalty": "Prosecution under the Occupational Health and Safety Act for a contravention of the Act or regulations: a fine of up to $2,000,000 for a corporation; up to $1,500,000 and/or 12 months' imprisonment for directors and officers; up to $500,000 and/or 12 months for any other person. A corporation's second or later offence causing death or serious injury within two years carries a minimum fine of $500,000.",
   "penaltySource": "ca_y_on_ohsa_ix"
  },
  "ca_x_on_isc": {
   "penalty": "A corporation that without reasonable cause contravenes the register requirement (OBCA s.140.2) is guilty of an offence with a fine of up to $5,000. A director or officer who knowingly authorizes, permits or acquiesces in the contravention, or knowingly records false or misleading information in the register, can be fined up to $200,000 and/or imprisoned for up to six months.",
   "penaltySource": "ca_y_on_obca",
   "note": null
  },
  "ca_x_qc_current": {
   "penalty": "Failing to file a declaration required by law (other than the declaration of registration), or filing a false, incomplete or misleading one, is an offence: a fine of $500 to $5,000 for a natural person and $1,000 to $10,000 in all other cases, doubled for repeat offences (directors, officers and attorneys face double the natural-person amounts). An enterprise cancelled ex officio risks suspension of its right to take legal action, and a cancelled Québec legal person is deemed dissolved.",
   "penaltySource": "ca_y_qc_req_sanctions",
   "note": null
  },
  "ca_x_qc_oqlf": {
   "penalty": "An enterprise that fails to comply with the francization process cannot obtain a contract or a subsidy from the Administration (Charter of the French Language s.152.1); since December 17, 2025, businesses with 25 or more employees must show proof of compliance when applying to validate a job offer (immigration). The fine amounts were not read.",
   "penaltySource": "ca_y_qc_charte_conf",
   "note": "Fines: oqlf.gouv.qc.ca returned 403 Forbidden and LégisQuébec returned 403, so the penal provisions of the Charter were not read."
  },
  "ca_x_bc_transparency": {
   "penalty": "Failing to do the annual review (s.119.3) or to keep the register up to date is an offence under s.426(4.1): a fine of up to $100,000 for a company (a person other than an individual) and up to $50,000 for an individual. The same maximums apply to a register that is false, misleading or incomplete, and to directors or officers who permit it (s.427.1).",
   "penaltySource": "ca_y_bc_bca_p13",
   "note": null
  },
  "ca_x_bc_paytransparency": {
   "penalty": "None set: the Act states no fine or penalty and disapplies the general offence in section 5 of the Offence Act. Non-compliance can be reported to the director of pay transparency, and the number and nature of such reports are published in the minister's annual report.",
   "penaltySource": "ca_y_bc_pta",
   "note": null
  },
  "ca_x_bc_jhsc": {
   "penalty": "WorkSafeBC may impose an administrative penalty for an occupational health and safety violation (high-risk or repeat non-compliance); the amount usually depends on payroll and the violation, up to a statutory maximum of $816,148.69 in 2026. For lower-risk failures to comply with an order or to send a compliance report, an OHS Citation of $656.48 (first) or $1,312.96 (repeat within three years) applies.",
   "penaltySource": "ca_y_wsbc_admpen"
  },
  "ca_x_ab_wcb_injury": {
   "penalty": "Late, incomplete or missing reports can delay the claim and raise claim costs; the employer may also face an audit, an administrative penalty, investigation of the accident with its costs charged to the employer, and disqualification from optional premium pricing (with refunds clawed back). In extreme cases, prosecution. The policy states no amount.",
   "penaltySource": "ca_y_wcbab_pol0105",
   "note": null
  },
  "ca_x_ab_pipa": {
   "penalty": "Failing to notify the Commissioner as required by section 34.1 is an offence: a fine of up to $10,000 for an individual and up to $100,000 for any other person. No offence if the organization acted reasonably in the circumstances.",
   "penaltySource": "ca_y_ab_pipa",
   "note": null
  }
 }
};
