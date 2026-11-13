// The non-tax duties of United Arab Emirates: company registry, employment, workplace safety, privacy and so on.
// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on 2026-11-13. Do not edit by hand:
// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.
import type { More } from '../more.ts';

export const more: More = {
 "version": "2026-11-13.3ca20261",
 "step": {
  "id": "ops",
  "title": "What else applies to you",
  "desc": "Tick what is true. Each tick can add a duty outside tax: documents to renew, staff, records, licences, registers.",
  "checklist": true
 },
 "departments": [
  {
   "id": "labour",
   "name": "Employment and workplace",
   "desc": "Emiratisation targets, work permits, workplace safety and health insurance for staff."
  },
  {
   "id": "residency",
   "name": "Identity and residency",
   "desc": "The establishment card, Emirates ID and residence visas."
  },
  {
   "id": "privacy",
   "name": "Data protection",
   "desc": "Registering with the data protection commissioner and reporting data breaches (DIFC and ADGM)."
  },
  {
   "id": "ip",
   "name": "Intellectual property",
   "desc": "Keeping registered trade marks and patents alive by renewing them and paying their fees on time."
  },
  {
   "id": "sector",
   "name": "Environment, safety and sector permits",
   "desc": "Permits and certificates that municipalities and civil defence require of businesses, with the cycle on which they are renewed."
  },
  {
   "id": "property",
   "name": "Home, premises and vehicles",
   "desc": "Registering a lease, notice before ending one, vehicle registration renewal and fire detectors at home."
  }
 ],
 "questions": [
  {
   "id": "ae_x_emp50",
   "step": "ops",
   "text": "Does the business have 50 or more employees?",
   "type": "yn",
   "help": "Count everyone on the establishment's file with the Ministry of Human Resources and Emiratisation. Emiratisation targets for skilled jobs apply from 50 employees.",
   "show": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_mohre",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "q": "ae_mohre",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_emp20",
   "step": "ops",
   "text": "Does the business have 20 to 49 employees?",
   "type": "yn",
   "help": "Count everyone on the establishment's file with the Ministry of Human Resources and Emiratisation.",
   "show": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "all": [
           {
            "any": [
             {
              "kind": [
               "sole_prop",
               "partnership",
               "corporation",
               "branch",
               "trust"
              ]
             },
             {
              "q": "ae_business",
              "yes": true
             }
            ]
           },
           {
            "q": "ae_employees",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_mohre",
          "yes": true
         }
        ]
       },
       {
        "not": {
         "q": "ae_x_emp50",
         "yes": true
        }
       }
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "q": "ae_mohre",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_emir_sector",
   "step": "ops",
   "text": "Does the business work in one of the 14 sectors named for Emiratisation?",
   "type": "yn",
   "help": "The sectors are: information and communications; financial and insurance activities; real estate; professional, scientific and technical activities; administrative and support services; education; healthcare and social work; arts and entertainment; mining and quarrying; manufacturing; construction; wholesale and retail trade; transportation and warehousing; hospitality.",
   "show": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "all": [
           {
            "all": [
             {
              "any": [
               {
                "kind": [
                 "sole_prop",
                 "partnership",
                 "corporation",
                 "branch",
                 "trust"
                ]
               },
               {
                "q": "ae_business",
                "yes": true
               }
              ]
             },
             {
              "q": "ae_employees",
              "yes": true
             }
            ]
           },
           {
            "q": "ae_mohre",
            "yes": true
           }
          ]
         },
         {
          "not": {
           "q": "ae_x_emp50",
           "yes": true
          }
         }
        ]
       },
       {
        "q": "ae_x_emp20",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "q": "ae_mohre",
      "yes": true
     },
     {
      "q": "ae_x_emp20",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_outdoor",
   "step": "ops",
   "text": "Do any of the business's staff work outdoors, under direct sunlight or in open places?",
   "type": "yn",
   "help": "For example on construction sites, roads, farms or deliveries on foot. The midday break applies to this work in summer.",
   "show": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_estcard",
   "step": "ops",
   "text": "Does the business hold an establishment card to sponsor residence visas?",
   "type": "yn",
   "help": "The establishment card (immigration file) is issued by the Federal Authority for Identity, Citizenship, Customs and Port Security, or by the residency directorate in Dubai. A business needs it to sponsor staff or partners.",
   "show": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_dpms",
   "step": "ops",
   "text": "Of those, is the business a dealer in precious metals or precious stones?",
   "type": "yn",
   "help": "Asked only after you said the business is one of the designated businesses above, to tell which one. Gold, jewellery, diamonds and similar. These dealers file a separate report for large cash and company transactions.",
   "show": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_dnfbp",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "corporate"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_realestate",
   "step": "ops",
   "text": "Of those, is the business a real estate broker or agent?",
   "type": "yn",
   "help": "Asked only after you said the business is one of the designated businesses above, to tell which one. Brokers and agents file a separate report for freehold sales paid in cash or with virtual assets.",
   "show": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_dnfbp",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "corporate"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_personal_data",
   "step": "ops",
   "text": "Does it handle personal data, for example of employees, customers or suppliers?",
   "type": "yn",
   "help": "The DIFC treats an entity that hires employees or serves customers as processing personal data. Such entities register with the data protection commissioner of their financial centre.",
   "show": {
    "all": [
     {
      "any": [
       {
        "etag": "difc"
       },
       {
        "etag": "adgm"
       }
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
   "id": "ae_x_difc_small",
   "step": "ops",
   "text": "Is it a small private company?",
   "type": "yn",
   "help": "The DIFC handbook describes a small private company as one with 20 or fewer shareholders, or an annual turnover of USD 5 million or less. Small companies have longer to file accounts.",
   "show": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "dept": [
       "corporate"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_fz_zone",
   "step": "ops",
   "text": "Which free zone licensed the company?",
   "type": "choice",
   "help": "Each free zone sets its own rules for filing audited accounts.",
   "options": [
    {
     "v": "jafza",
     "label": "Jebel Ali Free Zone (JAFZA), Dubai"
    },
    {
     "v": "dmcc",
     "label": "DMCC, Dubai"
    },
    {
     "v": "rakez",
     "label": "RAK Economic Zone (RAKEZ), Ras Al Khaimah"
    },
    {
     "v": "other",
     "label": "Another free zone"
    }
   ],
   "show": {
    "all": [
     {
      "all": [
       {
        "entity": [
         "fz"
        ]
       },
       {
        "state": [
         "DU",
         "RK"
        ]
       }
      ]
     },
     {
      "dept": [
       "corporate"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_adosh",
   "step": "ops",
   "text": "Has the business been told by its Abu Dhabi sector regulator to run an approved occupational safety and health management system?",
   "type": "yn",
   "help": "Under the Abu Dhabi Occupational Safety and Health System Framework (ADOSH-SF, formerly OSHAD-SF), nominated medium and high risk entities have an approved system and report to their sector regulatory authority.",
   "show": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "state": [
         "AZ"
        ]
       }
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_eid",
   "step": "ops",
   "text": "Do you hold an Emirates ID?",
   "type": "yn",
   "help": "Every UAE citizen and resident must hold a valid Emirates ID card.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_res_visa",
   "step": "ops",
   "text": "Do you live in the UAE on a residence visa?",
   "type": "yn",
   "help": "For example a visa sponsored by your employer or a family member, or a Golden or Green residence.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_dl",
   "step": "ops",
   "text": "Do you hold a UAE driving licence?",
   "type": "yn",
   "help": "A licence issued by any emirate's traffic authority (RTA in Dubai, the police traffic departments elsewhere).",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_vehicle",
   "step": "ops",
   "text": "Is a vehicle registered in your name in the UAE?",
   "type": "yn",
   "help": "A car, motorcycle or other vehicle whose ownership card (Mulkiya) is in your name or the business's name.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "branch",
       "trust"
      ]
     },
     {
      "dept": [
       "property"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_newborn",
   "step": "ops",
   "text": "Has a child been born to you in the UAE in the last four months?",
   "type": "yn",
   "help": "A baby born in the UAE needs a birth certificate within 30 days and a passport, Emirates ID and residence visa within 120 days.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_sponsor_family",
   "step": "ops",
   "text": "Do you sponsor the residence visa of your spouse, children or other family members?",
   "type": "yn",
   "help": "You are the sponsor if the family members' residence visas were issued on your file.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_domestic",
   "step": "ops",
   "text": "Do you employ a domestic worker (housemaid, driver, nanny) on your own sponsorship?",
   "type": "yn",
   "help": "A domestic worker whose residence visa is issued on your file.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_tenant_dubai",
   "step": "ops",
   "text": "Do you rent a home or premises in Dubai as the tenant?",
   "type": "yn",
   "help": "As the tenant under a lease. Letting out property you own is asked separately.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "branch",
       "trust"
      ]
     },
     {
      "dept": [
       "property"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_landlord",
   "step": "ops",
   "text": "Do you let out property you own in Abu Dhabi or Dubai?",
   "type": "yn",
   "help": "A home, office or shop you rent to a tenant under a lease.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "branch",
       "trust"
      ]
     },
     {
      "dept": [
       "property"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_citizen",
   "step": "ops",
   "text": "Are you a UAE citizen with an Emirati passport?",
   "type": "yn",
   "help": "Emirati passports are issued and renewed by ICP.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_trademark",
   "step": "ops",
   "text": "Do you own a trade mark registered with the UAE Ministry of Economy and Tourism?",
   "type": "yn",
   "help": "A brand name or logo registered in the UAE trade mark register.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "branch",
       "trust"
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
   "id": "ae_x_g_patent",
   "step": "ops",
   "text": "Do you own a UAE patent or industrial design, or have an application pending?",
   "type": "yn",
   "help": "Granted or pending at the Ministry of Economy and Tourism.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "branch",
       "trust"
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
   "id": "ae_x_g_house_owner",
   "step": "ops",
   "text": "Do you own a house (villa) that you or your family live in?",
   "type": "yn",
   "help": "A stand-alone residential house, not an apartment.",
   "show": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "dept": [
       "property"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_g_ns",
   "step": "ops",
   "text": "Are you an Emirati man aged 18 to 29 who has not yet done national service?",
   "type": "yn",
   "help": "National service is mandatory for medically fit Emirati men; students and some others may postpone it, and an only son or a medically unfit citizen is exempt. Asked only of UAE citizens.",
   "show": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "individual"
        ]
       },
       {
        "q": "ae_x_g_citizen",
        "yes": true
       }
      ]
     },
     {
      "dept": [
       "residency"
      ]
     }
    ]
   }
  },
  {
   "id": "ae_x_vat_stop",
   "step": "ops",
   "text": "Has the business stopped making taxable supplies, or were its taxable supplies over the last 12 months below AED 187,500?",
   "type": "yn",
   "help": "AED 187,500 is the voluntary registration threshold. A VAT-registered business in either case applies to deregister. Not asked when you said the business has stopped altogether.",
   "show": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "not": {
         "q": "ae_ceasing",
         "yes": true
        }
       }
      ]
     },
     {
      "dept": [
       "vat"
      ]
     },
     {
      "q": "ae_vat_reg",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "ae_x_excise_stop",
   "step": "ops",
   "text": "Has the business stopped importing, producing or stockpiling excise goods?",
   "type": "yn",
   "help": "A registrant who stops these activities is no longer responsible for excise tax six months after stopping, unless it will start again within those six months, and then applies to deregister. Not asked when you said the business has stopped altogether.",
   "show": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "not": {
         "q": "ae_ceasing",
         "yes": true
        }
       }
      ]
     },
     {
      "dept": [
       "vat"
      ]
     },
     {
      "q": "ae_excise",
      "yes": true
     }
    ]
   }
  }
 ],
 "compliances": [
  {
   "id": "ae_x_emiratisation_50",
   "name": "Emiratisation target (50 or more employees)",
   "dept": "labour",
   "head": "Emiratisation",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "Private sector establishments with 50 or more employees must raise the share of UAE nationals in their skilled jobs by 2 per cent every year, to reach an overall increase of 10 per cent by 2026. A company that falls short pays a monthly amount for each national it did not employ.",
   "why": "It has 50 or more employees and is registered with MoHRE.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_mohre",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_emp50",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Each year: 2 per cent more UAE nationals in skilled jobs"
   },
   "dueText": "Raise Emiratisation rates by 2 per cent annually for skilled jobs, to achieve an overall rate of increase of 10 per cent by 2026.",
   "weight": 88,
   "source": "ae_x_src_emirat",
   "verified": true,
   "form": "Emiratisation rate for skilled jobs",
   "penalty": "AED 6,000 a month (2023 level) for every UAE national not employed against the target; the amount increases by AED 1,000 each year until 2026.",
   "note": "The u.ae page gives the yearly rate only. The half-year split (1 per cent by 30 June and 1 per cent by 31 December) appears in search-result snippets of mohre.gov.ae, but that site returned HTTP 503 to every request on 2026-11-11 and was not opened. No rule for 2027 onward was found.",
   "roll": false
  },
  {
   "id": "ae_x_emiratisation_20_49",
   "name": "Emiratisation target (20 to 49 employees in 14 sectors)",
   "dept": "labour",
   "head": "Emiratisation",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "Since 2024, private companies with 20 to 49 workers in 14 named sectors must hire UAE nationals: at least one by the end of 2024 and one more by the end of 2025. A company that did not pays a yearly amount.",
   "why": "It has 20 to 49 employees and works in one of the named sectors.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_mohre",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_emp20",
      "yes": true
     },
     {
      "q": "ae_x_emir_sector",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "One UAE national by end of 2024 and one more by end of 2025"
   },
   "dueText": "Hire at least one UAE citizen by end of 2024, and one more Emirati by end of 2025.",
   "weight": 70,
   "source": "ae_x_src_emirat",
   "verified": false,
   "form": "Hiring UAE nationals",
   "penalty": "AED 96,000 charged in January 2025 for not hiring one Emirati in 2024; AED 108,000 in January 2026 for not hiring two Emiratis in 2025.",
   "note": "The page states targets only up to the end of 2025. Whether a further hire or payment applies for 2026 and later was not found on an official page (mohre.gov.ae returned HTTP 503).",
   "roll": false
  },
  {
   "id": "ae_x_midday_break",
   "name": "Midday break for outdoor work",
   "dept": "labour",
   "head": "Workplace safety",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "Every summer, work under direct sunlight and in open places is not allowed in the middle of the day. Some jobs are exempt for technical reasons.",
   "why": "Its staff work outdoors.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_outdoor",
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
      15
     ]
    ]
   },
   "dueText": "No work under direct sunlight and in open places between 12.30 pm and 3 pm, from 15 June to 15 September of every year.",
   "weight": 72,
   "source": "ae_x_src_hs",
   "verified": true,
   "form": "Mid-day work ban",
   "note": "The date shown is the first day of the ban; it runs until 15 September. The u.ae page states no fine. A fine per worker is quoted in MoHRE announcements, but mohre.gov.ae could not be opened (HTTP 503), so it is not given here.",
   "roll": false
  },
  {
   "id": "ae_x_injury_48h",
   "name": "Report a workplace injury or death",
   "dept": "labour",
   "head": "Workplace safety",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "When a worker is injured or dies at the workplace, the employer tells the Ministry. All establishments also report injuries and occupational diseases through the Ministry's approved channels.",
   "why": "It employs staff.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_mohre",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 48 hours of the incident"
   },
   "dueText": "The employer must inform MoHRE within 48 hours from the incident.",
   "weight": 74,
   "source": "ae_x_src_hs",
   "verified": true,
   "form": "Work injury report",
   "note": "The page names Ministerial Resolution No. 657 of 2022 as the basis. It states no penalty.",
   "roll": false
  },
  {
   "id": "ae_x_work_permit_renew",
   "name": "Renew work permits",
   "dept": "labour",
   "head": "Work permits",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "A work permit for a worker recruited from abroad, transferred, sponsored by family, or holding a Golden visa is valid for two years. It is renewed for the worker to go on working legally.",
   "why": "It employs staff and is registered with MoHRE.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_mohre",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each work permit expires (permits are valid for two years)"
   },
   "dueText": "The permit is valid for two years. Renewal requires settling any outstanding fines for late issuance or non-renewal of the permit.",
   "weight": 75,
   "source": "ae_x_src_permits",
   "verified": false,
   "form": "Work permit renewal",
   "note": "The page gives the validity and says fines exist for non-renewal, but not the renewal window or the fine amounts. MoHRE's own service pages could not be opened (HTTP 503).",
   "roll": false
  },
  {
   "id": "ae_x_health_dubai",
   "name": "Health insurance for employees (Dubai)",
   "dept": "labour",
   "head": "Insurance",
   "authority": "Dubai Health Authority",
   "brief": "An employer in Dubai enrols its employees in health insurance, pays the full cost, keeps the cover valid for the whole time they work for it, and shows the policy when a residence permit is issued or renewed. The minimum cover is the Essential Benefits Plan.",
   "why": "It employs staff in Dubai.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "From the day an employee starts, and at each issue or renewal of a residence permit"
   },
   "dueText": "Ensure that employees' health insurance is valid throughout their service period, and produce a health insurance policy when issuing or renewing the residence permits of employees.",
   "weight": 84,
   "source": "ae_x_src_dxb_health",
   "verified": true,
   "form": "Health insurance policy",
   "penalty": "A fine of not less than AED 500 and not more than AED 150,000, doubled if the violation is repeated within one year, up to AED 500,000. The amounts for each violation are set by a resolution of the Executive Council.",
   "note": "The schedule of fines for each violation (an Executive Council resolution) was not read.",
   "roll": false
  },
  {
   "id": "ae_x_gpssa_register",
   "name": "Register a new Emirati employee for pension",
   "dept": "payroll",
   "head": "Payroll",
   "authority": "General Pension and Social Security Authority",
   "brief": "When a UAE national joins, the employer registers them with the pension authority through its employer portal and starts paying contributions.",
   "why": "You employ UAE nationals outside the Emirate of Abu Dhabi.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_emirati",
        "yes": true
       }
      ]
     },
     {
      "not": {
       "state": [
        "AZ"
       ]
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days of the employee joining"
   },
   "dueText": "The employer must register the employee with the Authority within 30 days from the date of their joining service. (The Authority's service page says within one month; the shorter period is shown.)",
   "weight": 82,
   "source": "ae_x_src_gpssa_reg",
   "verified": true,
   "form": "Registration of an insured",
   "penalty": "The Authority's FAQ lists a fine of AED 5,000 for each insured person not registered, and an additional amount of AED 200 a day for each insured person for missing the registration deadline; it does not say how the two relate.",
   "note": "The Authority covers private-sector employers in every emirate except Abu Dhabi, whose employers deal with the Abu Dhabi Pension Fund (shown as its own item).",
   "roll": false
  },
  {
   "id": "ae_x_gpssa_leaver",
   "name": "Tell the pension authority when an Emirati employee leaves",
   "dept": "payroll",
   "head": "Payroll",
   "authority": "General Pension and Social Security Authority",
   "brief": "When an insured UAE national's service ends, the employer reports it to the pension authority.",
   "why": "You employ UAE nationals outside the Emirate of Abu Dhabi.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_emirati",
        "yes": true
       }
      ]
     },
     {
      "not": {
       "state": [
        "AZ"
       ]
      }
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within one month of the end of service"
   },
   "dueText": "Within a maximum of one month from the date of termination of their service.",
   "weight": 70,
   "source": "ae_x_src_gpssa_faq",
   "verified": true,
   "form": "End-of-service notification",
   "penalty": "An additional amount of AED 200 for each day of delay, for each insured person.",
   "roll": false
  },
  {
   "id": "ae_x_adpf_pension",
   "name": "Pension for UAE nationals (Abu Dhabi Pension Fund)",
   "dept": "payroll",
   "head": "Payroll",
   "authority": "Abu Dhabi Pension Fund",
   "brief": "Private-sector employers in the Emirate of Abu Dhabi are outside the federal pension authority's scheme. They register their Emirati employees and pay pension contributions with the Abu Dhabi fund.",
   "why": "You employ UAE nationals in the Emirate of Abu Dhabi.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_emirati",
        "yes": true
       }
      ]
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "When you employ a UAE national: confirm the time limits with the Abu Dhabi Pension Fund",
    "within": null
   },
   "dueText": "The Abu Dhabi fund's time limit for registering an employee and its date for paying contributions could not be read (its site returned an error on 2026-11-12). Confirm both with the Abu Dhabi Pension Fund before you rely on any date.",
   "weight": 85,
   "source": "ae_x_src_gpssa_reg",
   "verified": false,
   "form": "Registration and monthly contributions with the Abu Dhabi fund",
   "note": "The General Pension and Social Security Authority's page says its scheme covers private-sector employers in all emirates except Abu Dhabi. The Abu Dhabi Pension Fund's own pages (pension.gov.ae) returned HTTP 503 and a system error on 2026-11-12, so its rules are not stated here.",
   "roll": false
  },
  {
   "id": "ae_x_estcard_renew",
   "name": "Renew the establishment card",
   "dept": "residency",
   "head": "Establishment card",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "The establishment card is the business's immigration file. It is renewed after it expires, and only if the trade licence is valid and fines on the establishment are paid.",
   "why": "It holds an establishment card.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_estcard",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Within 30 days of the card's expiry date"
   },
   "dueText": "Renew within 30 days from the expiry date of the establishment card.",
   "weight": 76,
   "source": "ae_x_src_estcard",
   "verified": true,
   "form": "Renewal of Establishment Card",
   "penalty": "AED 100 for each month of delay, up to a maximum of AED 1,000.",
   "note": "The page lists an annual renewal fee (AED 100 a year) but does not state how long a card is valid. In Dubai the card is renewed with the General Directorate of Residency and Foreigners Affairs.",
   "roll": false
  },
  {
   "id": "ae_x_eid_renew",
   "name": "Renew your Emirates ID",
   "dept": "residency",
   "head": "Emirates ID",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "The Emirates ID can be renewed after it expires or as early as six months before. A late fee applies once a month has passed since expiry.",
   "why": "You hold an Emirates ID.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_eid",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within one month after the card expires"
   },
   "dueText": "The card can be renewed after its expiry or as early as six months before its expiry; a late fee is charged after one month since expiry.",
   "weight": 70,
   "source": "ae_x_src_eid",
   "verified": true,
   "form": "Identity Card Renewal",
   "penalty": "AED 20 for each day of delay, up to a maximum of AED 1,000.",
   "roll": false
  },
  {
   "id": "ae_x_visa_renew",
   "name": "Renew your residence visa",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "A residence visa is renewed by the sponsor before it expires. Staying on after the visa and its grace period have run out is charged by the day.",
   "why": "You live in the UAE on a residence visa.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_res_visa",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the residence visa expires"
   },
   "dueText": "Your sponsor must renew your residence visa before it expires.",
   "weight": 72,
   "source": "ae_x_src_visa",
   "verified": true,
   "form": "Residence visa renewal",
   "penalty": "AED 50 for each day of overstay.",
   "note": "The page says residents get grace periods of up to 6 months after a permit expires or is cancelled, depending on the resident's category.",
   "roll": false
  },
  {
   "id": "ae_x_aml_officer",
   "name": "Appoint an anti-money-laundering compliance officer",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "Ministry of Economy and Tourism",
   "brief": "A designated non-financial business or profession appoints a qualified compliance officer at management level to run its anti-money-laundering programme. The supervisory authority must approve the appointment in writing beforehand, and be told of later changes to the role.",
   "why": "It is a designated non-financial business or profession.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_dnfbp",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "When you start the activity (no date is stated)"
   },
   "dueText": "No date is stated. The appointment must receive the prior written approval of the relevant Supervisory Authority.",
   "weight": 68,
   "source": "ae_x_src_dnfbp",
   "verified": true,
   "form": "Compliance officer (MLRO) appointment",
   "penalty": "AED 50,000 to AED 200,000 for failing to appoint a compliance officer with appropriate competence and expertise.",
   "roll": false
  },
  {
   "id": "ae_x_str",
   "name": "Report suspicious transactions",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "UAE Financial Intelligence Unit",
   "brief": "When there are reasonable grounds to suspect that funds are linked to a crime, the business reports it to the Financial Intelligence Unit through goAML. There is no minimum amount, and attempted transactions count. Records are kept for at least five years.",
   "why": "It is a designated non-financial business or profession.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_dnfbp",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without delay, once there is suspicion or reasonable grounds to suspect"
   },
   "dueText": "Report to the FIU without delay when there are suspicions, or reasonable grounds to suspect, that the proceeds are related to a crime.",
   "weight": 80,
   "source": "ae_x_src_dnfbp",
   "verified": true,
   "form": "Suspicious Transaction Report or Suspicious Activity Report (goAML)",
   "penalty": "AED 100,000 to AED 500,000 for failing to promptly submit suspicious transaction reports to the Financial Intelligence Unit. The guidelines add that failing to report without delay is a federal crime.",
   "roll": false
  },
  {
   "id": "ae_x_tfs_register",
   "name": "Register for sanctions list notifications",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "Executive Office for Control and Non-Proliferation",
   "brief": "Reporting entities register on the Executive Office's website to receive automatic updates to the UN and UAE sanctions lists, and screen their customers against those lists continuously.",
   "why": "It is a designated non-financial business or profession.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_dnfbp",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "When you start the activity (no date is stated)"
   },
   "dueText": "No date is stated. Reporting Entities are required to register with the Notification Alert System on the Executive Office's website.",
   "weight": 66,
   "source": "ae_x_src_eocn",
   "verified": true,
   "form": "Notification Alert System registration",
   "penalty": "AED 50,000 to AED 1,000,000 for failing to register on the Executive Office's website to receive sanctions notifications.",
   "roll": false
  },
  {
   "id": "ae_x_tfs_freeze",
   "name": "Freeze and report a sanctions match",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "Executive Office for Control and Non-Proliferation",
   "brief": "If a customer or party matches a name on the UN or UAE sanctions lists, the business freezes the funds without telling the person, and reports what it did through goAML.",
   "why": "It is a designated non-financial business or profession.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_dnfbp",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Freeze within 24 hours; report within five business days"
   },
   "dueText": "Freeze without delay (immediately or in any case within 24 hours), and report through goAML within five business days from taking any freezing measure.",
   "weight": 78,
   "source": "ae_x_src_eocn",
   "verified": true,
   "form": "Confirmed Name Match Report or Partial Name Match Report (goAML)",
   "penalty": "Imprisonment of one to seven years and/or a fine of AED 50,000 to AED 5,000,000 for breaching Cabinet Decision No. 74 of 2020. Administrative fines under Cabinet Resolution No. 71 of 2024: AED 500,000 to AED 1,000,000 for not freezing promptly; AED 50,000 to AED 100,000 for not promptly reporting the freeze.",
   "note": "The Executive Office's page now names the reports CNMR and PNMR; its 2021 guidance called the first one a Funds Freeze Report (FFR).",
   "roll": false
  },
  {
   "id": "ae_x_dpmsr",
   "name": "Report large precious metals and stones transactions",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "UAE Financial Intelligence Unit",
   "brief": "A dealer files a report for each cash transaction of AED 55,000 or more with an individual (resident or not), and each transaction of AED 55,000 or more with a company, in cash or by wire transfer. Linked transactions are added together. It is due even when nothing looks suspicious.",
   "why": "It is a dealer in precious metals or stones.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_dpms",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "For each transaction at or above AED 55,000"
   },
   "dueText": "File a DPMSR for each transaction that meets the threshold. The guidance refers to 'predefined parameters and timelines' but states no number of days.",
   "weight": 76,
   "source": "ae_x_src_dpms",
   "verified": false,
   "form": "Dealers in Precious Metals & Stones Report (DPMSR, goAML)",
   "note": "The trigger and who must file were read. The time limit for filing was not: the Financial Intelligence Unit's report guides (uaefiu.gov.ae) returned HTTP 403, and the Ministry's Circular 08/AML/2021 states none.",
   "roll": false
  },
  {
   "id": "ae_x_rear",
   "name": "Report cash and virtual-asset property deals",
   "dept": "corporate",
   "head": "Anti-money laundering",
   "authority": "UAE Financial Intelligence Unit",
   "brief": "A broker or agent files a report for each purchase or sale of freehold property where cash of AED 55,000 or more is paid, in one payment or several, or where a virtual asset pays for any part of the price or the funds were converted from or to a virtual asset. It is due even when nothing looks suspicious.",
   "why": "It is a real estate broker or agent.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_realestate",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "For each freehold sale that meets the conditions"
   },
   "dueText": "File a REAR for each transaction that meets the conditions. The guidance refers to 'predefined parameters and timelines' but states no number of days.",
   "weight": 76,
   "source": "ae_x_src_rear",
   "verified": false,
   "form": "Real Estate Activity Report (REAR, goAML)",
   "note": "The trigger and who must file were read. The time limit for filing was not: the Financial Intelligence Unit's report guides (uaefiu.gov.ae) returned HTTP 403, and the Ministry's Circular 05/2022 states none.",
   "roll": false
  },
  {
   "id": "ae_x_llc_agm",
   "name": "Hold the yearly general assembly (LLC)",
   "dept": "corporate",
   "head": "Company meetings",
   "authority": "Your emirate's economic department",
   "brief": "The manager of a limited liability company calls a general assembly of the partners at least once a year. It considers the accounts and the auditor's report and appoints the auditor: an LLC must have its accounts audited every year, and keep its accounting registers at its head office for at least five years.",
   "why": "It is a mainland limited liability company.",
   "applies": {
    "entity": [
     "llc"
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 4
   },
   "dueText": "At least once per year, within the four months following the end of the fiscal year of the company.",
   "weight": 70,
   "source": "ae_x_src_ccl",
   "verified": true,
   "form": "Annual general assembly",
   "note": "Read in the English text of Federal Decree-Law No. 32 of 2021 hosted by the Ministry. A 2025 amending decree-law exists and was not checked against this article.",
   "roll": false
  },
  {
   "id": "ae_x_jsc_agm",
   "name": "Hold the annual general assembly (joint stock company)",
   "dept": "corporate",
   "head": "Company meetings",
   "authority": "Ministry of Economy and Tourism (private JSC) or Securities and Commodities Authority (public JSC)",
   "brief": "The board of a joint stock company calls the shareholders' general assembly at least once a year. For private joint stock companies the Ministry ties the renewal of the company's registration to the filed assembly minutes and audited financial statements.",
   "why": "It is a joint stock company.",
   "applies": {
    "entity": [
     "jsc"
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 4
   },
   "dueText": "At least once every year, within four months following the end of the fiscal year.",
   "weight": 74,
   "source": "ae_x_src_ccl",
   "verified": true,
   "form": "Annual general assembly",
   "penalty": "The Ministry's notice of 8 June 2026 to private joint stock companies: cautions, then fines of up to AED 10 million, with stricter measures for repeat offenders.",
   "note": "For financial years ended 31 December 2025 the Ministry's notice asked private joint stock companies to hold the assembly no later than 30 June 2026.",
   "roll": false
  },
  {
   "id": "ae_x_difc_accounts",
   "name": "File annual accounts (DIFC, company that is not small)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "DIFC Registrar of Companies",
   "brief": "A DIFC private company that is not a small private company files audited accounts with the Registrar every year.",
   "why": "It is a DIFC company that is not small.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "q": "ae_x_difc_small",
      "no": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 7
   },
   "dueText": "Audited accounts, within seven (7) months from the end of the financial year, where the company is a non-small private company.",
   "weight": 80,
   "source": "ae_x_src_difc_hb",
   "verified": true,
   "form": "Audited accounts",
   "note": "From the compliance calendar of the DIFC handbook for private companies; the handbook says DIFC legislation prevails if the two differ. Public companies were not checked.",
   "roll": false
  },
  {
   "id": "ae_x_difc_accounts_small",
   "name": "File annual accounts (DIFC, small private company)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "DIFC Registrar of Companies",
   "brief": "A small DIFC private company files its accounts with the Registrar every year.",
   "why": "It is a small DIFC private company.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "q": "ae_x_difc_small",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 9
   },
   "dueText": "Accounts, within nine (9) months from the end of the financial year, for all other private companies.",
   "weight": 78,
   "source": "ae_x_src_difc_hb",
   "verified": true,
   "form": "Accounts",
   "note": "From the compliance calendar of the DIFC handbook for private companies; the handbook says DIFC legislation prevails if the two differ.",
   "roll": false
  },
  {
   "id": "ae_x_difc_changes",
   "name": "Report company changes to the DIFC Registrar",
   "dept": "corporate",
   "head": "Registers",
   "authority": "DIFC Registrar of Companies",
   "brief": "A DIFC company files each change with the Registrar: directors, company secretary, registered address, name, activities, shareholders, share capital, articles, ultimate beneficial owners, auditor, financial year end, and special resolutions.",
   "why": "It is a DIFC company.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days of the change"
   },
   "dueText": "Within 30 days of any change (within 30 days of the appointment or cessation for an auditor; within 30 days of the date of the resolution for a special resolution).",
   "weight": 72,
   "source": "ae_x_src_difc_hb",
   "verified": true,
   "form": "Corporate action filings",
   "roll": false
  },
  {
   "id": "ae_x_difc_ubo",
   "name": "Set up the beneficial ownership register (DIFC)",
   "dept": "corporate",
   "head": "Registers",
   "authority": "DIFC Registrar of Companies",
   "brief": "A DIFC registered person keeps a register of its ultimate beneficial owners, records changes, and notifies the Registrar of each change. A company with nominee directors also keeps a register of them.",
   "why": "It is a DIFC company.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 30 days of incorporation or registration",
    "from": "ae_lic_date"
   },
   "dueText": "Establish a Beneficial Ownership Register within thirty (30) days of incorporation or registration; record changes within thirty (30) days of becoming aware of them; notify the Registrar within thirty (30) days of making the change.",
   "weight": 74,
   "source": "ae_x_src_difc_ubo",
   "verified": true,
   "form": "Beneficial Ownership Register",
   "penalty": "A fine under Article 61(4) of the regulations' parent law; the amount was not read.",
   "roll": false
  },
  {
   "id": "ae_x_difc_final_pay",
   "name": "Pay final dues to a leaving employee (DIFC)",
   "dept": "payroll",
   "head": "Payroll",
   "authority": "Dubai International Financial Centre",
   "brief": "When employment ends, a DIFC employer pays the employee all remuneration and other amounts owed.",
   "why": "It is a DIFC employer.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "etag": "difc"
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days after the termination date"
   },
   "dueText": "Within fourteen (14) days after the Termination Date.",
   "weight": 70,
   "source": "ae_x_src_difc_emp",
   "verified": true,
   "form": "Payments following termination",
   "note": "The law provides a penalty for late payment that was not read.",
   "roll": false
  },
  {
   "id": "ae_x_difc_dp_notify",
   "name": "Notify the DIFC data protection commissioner",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "DIFC Commissioner of Data Protection",
   "brief": "A newly licensed DIFC entity that processes, or intends to process, personal data submits a notification through the DIFC portal. Hiring employees or serving customers counts as processing personal data.",
   "why": "It is a DIFC entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 6 months of the incorporation date"
   },
   "dueText": "The completed notification must be submitted within six (6) months from the date of issuance of the DIFC license.",
   "weight": 72,
   "source": "ae_x_src_difc_hb",
   "verified": true,
   "form": "Data Protection Notification",
   "note": "Registration fees by category: USD 1,250 (DFSA-regulated), USD 750 (non-regulated, except retail), USD 250 (retail). Fines were not read. Two DIFC documents state the start differently: the handbook's compliance calendar says within 6 months from the incorporation date, the data protection page says within six months from the date of issuance of the DIFC licence. The earlier one (incorporation) is shown.",
   "roll": false
  },
  {
   "id": "ae_x_difc_dp_renew",
   "name": "Renew the DIFC data protection notification",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "DIFC Commissioner of Data Protection",
   "brief": "The notification to the Commissioner is updated every year, and changes to the processing are notified. An entity that has appointed a data protection officer also submits a yearly assessment through the DIFC portal.",
   "why": "It is a DIFC entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year (the DIFC portal sets the date)"
   },
   "dueText": "The notification to the Commissioner of Data Protection must be updated annually.",
   "weight": 70,
   "source": "ae_x_src_difc_dp",
   "verified": true,
   "form": "Annual renewal of the notification",
   "note": "Annual renewal fees: USD 500, USD 250 or USD 100 by category. The page does not give the day; DIFC handbooks indicate it is done with the licence renewal, which was not confirmed. Fines were not read.",
   "roll": false
  },
  {
   "id": "ae_x_difc_breach",
   "name": "Report a personal data breach (DIFC)",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "DIFC Commissioner of Data Protection",
   "brief": "A DIFC controller tells the Commissioner about a personal data breach, and tells the people affected when the breach is likely to be a high risk to them.",
   "why": "It is a DIFC entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "difc"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as practicable after the breach"
   },
   "dueText": "As soon as practicable in the circumstances.",
   "weight": 66,
   "source": "ae_x_src_difc_dp",
   "verified": true,
   "form": "Personal data breach notification",
   "note": "The DIFC law sets no fixed number of hours.",
   "roll": false
  },
  {
   "id": "ae_x_adgm_accounts",
   "name": "File annual accounts (ADGM)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "ADGM Registration Authority",
   "brief": "An ADGM company or LLP files its annual accounts with the Registrar. A small company (turnover up to USD 13.5 million and no more than 35 employees) may file an unaudited balance sheet instead of full audited accounts.",
   "why": "It is registered in ADGM.",
   "applies": {
    "all": [
     {
      "etag": "adgm"
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 9
   },
   "dueText": "The annual accounts must be filed within nine (9) months of the accounting reference date. For public companies, the period for filing is six (6) months, rather than nine.",
   "weight": 82,
   "source": "ae_x_src_adgm_acc",
   "verified": true,
   "form": "Annual accounts",
   "note": "The date shown is for a private company. First accounts covering more than 12 months are due nine months from the first anniversary of incorporation. Restricted scope companies file only if the Registrar gives notice. The page states no late-filing penalty.",
   "roll": false
  },
  {
   "id": "ae_x_adgm_gratuity",
   "name": "End-of-service gratuity and final pay (ADGM)",
   "dept": "payroll",
   "head": "Payroll",
   "authority": "ADGM Registration Authority (Employment Affairs Office)",
   "brief": "ADGM has its own employment rules in place of the federal labour law. An employee who completes one year or more of continuous employment is owed a gratuity when the employment ends, whatever the reason: 21 days' basic wage for each of the first five years of service and 30 days' basic wage for each further year. UAE and GCC nationals enrolled in the pension scheme, and employees who chose a pension or savings scheme instead, are not owed it.",
   "why": "It is an ADGM employer.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "all": [
         {
          "any": [
           {
            "kind": [
             "sole_prop",
             "partnership",
             "corporation",
             "branch",
             "trust"
            ]
           },
           {
            "q": "ae_business",
            "yes": true
           }
          ]
         },
         {
          "q": "ae_employees",
          "yes": true
         }
        ]
       },
       {
        "etag": "adgm"
       }
      ]
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 21 calendar days of the employee's termination date"
   },
   "dueText": "The gratuity is owed at the termination of employment. All wages and any other amounts owed to the employee (other than variable pay such as bonuses or commissions) must be paid within 21 calendar days of the employee's termination date.",
   "weight": 60,
   "source": "ae_x_src_adgm_er_guide",
   "verified": true,
   "form": "End-of-service gratuity payment",
   "note": "Read in the Employment Affairs Office's guidance on the ADGM Employment Regulations 2024 (published 18 February 2025), sections 22 and 24. The regulations themselves were not opened. No penalty was read.",
   "roll": false
  },
  {
   "id": "ae_x_adgm_dp_renew",
   "name": "Renew the ADGM data protection registration",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "ADGM Office of Data Protection",
   "brief": "ADGM entities that process personal data register as data controllers and renew every year for USD 300. A change in the registered particulars is notified as it happens, free of charge.",
   "why": "It is an ADGM entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "adgm"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "anniversary",
    "of": "ae_lic_date",
    "months": 1
   },
   "dueText": "Data protection registrations must be renewed annually; the renewal fee must be paid within the one-month grace period following the anniversary of incorporation.",
   "weight": 74,
   "source": "ae_x_src_adgm_dpfee",
   "verified": true,
   "form": "Data protection registration renewal",
   "penalty": "A fixed monetary penalty of USD 450 on the data protection fees page; ADGM's annual filings page says late payment could result in a fine of USD 750. The two official pages differ.",
   "note": "The date shown is the end of the grace month and assumes the licence date you gave is the date of incorporation.",
   "roll": false
  },
  {
   "id": "ae_x_adgm_ubo_change",
   "name": "Report a change of beneficial owner (ADGM)",
   "dept": "corporate",
   "head": "Registers",
   "authority": "ADGM Registration Authority",
   "brief": "ADGM entities keep a record of the required particulars of their beneficial owners and report changes to the Registrar. Branches of foreign companies and partnerships are outside these rules.",
   "why": "It is registered in ADGM.",
   "applies": {
    "all": [
     {
      "etag": "adgm"
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of the change"
   },
   "dueText": "Report changes to the Registrar within 15 days of a change.",
   "weight": 74,
   "source": "ae_x_src_adgm_bo",
   "verified": true,
   "form": "Notification of change in beneficial ownership",
   "penalty": "Up to a Level 9 fine (USD 54,000,000 is the maximum the page states).",
   "roll": false
  },
  {
   "id": "ae_x_adgm_breach",
   "name": "Report a personal data breach (ADGM)",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "ADGM Office of Data Protection",
   "brief": "An ADGM data controller reports a personal data breach to the Office of Data Protection through the Online Registry Solution.",
   "why": "It is an ADGM entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "adgm"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 72 hours of becoming aware of the breach, where feasible"
   },
   "dueText": "Without undue delay and, where feasible, not later than 72 hours after becoming aware of the breach.",
   "weight": 70,
   "source": "ae_x_src_adgm_breach",
   "verified": true,
   "form": "Personal data breach notification",
   "roll": false
  },
  {
   "id": "ae_x_adgm_dpo",
   "name": "Notify the appointment or resignation of a data protection officer (ADGM)",
   "dept": "privacy",
   "head": "Data protection",
   "authority": "ADGM Office of Data Protection",
   "brief": "An ADGM entity that appoints a data protection officer, or whose officer resigns, tells the Commissioner of Data Protection.",
   "why": "It is an ADGM entity that handles personal data.",
   "applies": {
    "all": [
     {
      "etag": "adgm"
     },
     {
      "q": "ae_x_personal_data",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within one month of the appointment or resignation"
   },
   "dueText": "Notify the Commissioner of Data Protection within one month of appointing a DPO or of the DPO's resignation.",
   "weight": 55,
   "source": "ae_x_src_adgm_faq",
   "verified": true,
   "form": "Data protection officer notification",
   "note": "Which entities must appoint an officer was not read.",
   "roll": false
  },
  {
   "id": "ae_x_dmcc_afs",
   "name": "Submit audited financial statements (DMCC)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "DMCC Authority",
   "brief": "Every DMCC company, including subsidiaries and branches, uploads its audited financial statements and the auditor's signed summary sheet on the DMCC member portal each year. The auditor must be on DMCC's Approved Auditors List.",
   "why": "It is a DMCC company.",
   "applies": {
    "all": [
     {
      "entity": [
       "fz"
      ]
     },
     {
      "state": [
       "DU"
      ]
     },
     {
      "q": "ae_x_fz_zone",
      "is": "dmcc"
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 6
   },
   "dueText": "Within six months after the end of each financial year.",
   "weight": 80,
   "source": "ae_x_src_dmcc_afs",
   "verified": true,
   "form": "Audited Financial Statements and Summary Sheet",
   "note": "The guideline states no penalty. An older DMCC sheet said 90 days; this guideline is dated 29 April 2025. A foreign company's DMCC branch is entity type 'branch' in the checker and is not reached by this condition.",
   "roll": false
  },
  {
   "id": "ae_x_jafza_audit",
   "name": "Submit the yearly audit report (JAFZA)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "Jebel Ali Free Zone Authority",
   "brief": "A JAFZA FZE or FZCO gives the Authority an updated audit report every year, through the Dubai Trade portal. The auditor must hold a Dubai economic department licence and be appointed by a company resolution.",
   "why": "It is a JAFZA company.",
   "applies": {
    "all": [
     {
      "entity": [
       "fz"
      ]
     },
     {
      "state": [
       "DU"
      ]
     },
     {
      "q": "ae_x_fz_zone",
      "is": "jafza"
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year (no date is stated)"
   },
   "dueText": "FZE and FZCO establishments must provide an updated audit report to the Authority annually. The page states no date.",
   "weight": 74,
   "source": "ae_x_src_jafza_audit",
   "verified": true,
   "form": "Audit report submission (FZE and FZCO)",
   "note": "No deadline and no penalty are on the page. The financial year must be between 6 and 18 months.",
   "roll": false
  },
  {
   "id": "ae_x_adosh_quarterly",
   "name": "Quarterly safety performance report (Abu Dhabi)",
   "dept": "labour",
   "head": "Workplace safety",
   "authority": "Your Abu Dhabi sector regulatory authority",
   "brief": "An entity with an approved occupational safety and health management system reports its safety performance (incidents, lost days and similar) to its sector regulator every quarter, starting the quarter after the system is approved.",
   "why": "It has an approved safety management system in Abu Dhabi.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_adosh",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1,
    "day": 15
   },
   "dueText": "Q1: 1st to (maximum) 15th of April; Q2: 15th of July; Q3: 15th of October; Q4: 15th of January of the following year.",
   "weight": 66,
   "source": "ae_x_src_adosh6",
   "verified": true,
   "form": "ADOSH-SF Form E",
   "note": "The same mechanism requires a yearly report of the monetary cost of OSH incidents within the first quarter of the next year, and an annual third-party audit report within 30 calendar days of the audit.",
   "roll": false
  },
  {
   "id": "ae_x_adosh_incident",
   "name": "Notify a serious workplace incident (Abu Dhabi)",
   "dept": "labour",
   "head": "Workplace safety",
   "authority": "Your Abu Dhabi sector regulatory authority",
   "brief": "An entity notifies its sector regulator of a fatality or other serious incident at the workplace (serious injury, serious occupational illness, serious dangerous occurrence), then sends the investigation report.",
   "why": "It has an approved safety management system in Abu Dhabi.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "any": [
         {
          "kind": [
           "sole_prop",
           "partnership",
           "corporation",
           "branch",
           "trust"
          ]
         },
         {
          "q": "ae_business",
          "yes": true
         }
        ]
       },
       {
        "q": "ae_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_x_adosh",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 24 hours for a fatality; within 3 working days for other serious incidents"
   },
   "dueText": "Within 24 hours of an incident which results in a fatality; within a maximum of 3 working days for other serious incidents. The investigation report follows within 30 calendar days.",
   "weight": 68,
   "source": "ae_x_src_adosh11",
   "verified": true,
   "form": "ADOSH-SF Form G",
   "roll": false
  },
  {
   "id": "ae_x_dubai_customs_renew",
   "name": "Renew the Dubai Customs business code",
   "dept": "corporate",
   "head": "Registers",
   "authority": "Dubai Customs",
   "brief": "The Dubai Customs business code is valid only as long as the trade licence. After the licence is renewed, the business renews its customs registration (fee AED 25) to go on clearing goods.",
   "why": "It imports or exports goods through Dubai.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_customs",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "After each trade licence renewal, within 60 days of the licence expiry date"
   },
   "dueText": "The validity of the business code is associated with the validity of the licence; renewal can be requested only after the licence is renewed. Customs policy: renew on expiry or within the grace period of sixty (60) days from the licence expiry date.",
   "weight": 64,
   "source": "ae_x_src_dc_guide",
   "verified": true,
   "form": "Business Registration Renewal",
   "penalty": "The customs client code is suspended if not renewed within sixty (60) days from the date of its expiry.",
   "note": "The 60-day grace period and the suspension come from a Dubai Customs policy in force from 22 October 2009, published in its Customs Policies booklet; no later text was found. Only Dubai was read; Abu Dhabi's TAMM pages could not be opened.",
   "roll": false
  },
  {
   "id": "ae_x_g_dl_renew",
   "name": "Renew your driving licence",
   "dept": "residency",
   "head": "Driving licence",
   "authority": "Your emirate's traffic authority (RTA in Dubai)",
   "brief": "A UAE driving licence is renewed when it expires: a renewed licence lasts 10 years for UAE and GCC citizens, 5 years for other residents aged 21 or over, and 1 year under 21. Traffic fines must be paid before renewal.",
   "why": "You hold a UAE driving licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years (10 years for UAE and GCC citizens, 1 year under 21), by the expiry date on the licence"
   },
   "dueText": "A renewed driving licence is valid for 10 years for all UAE and GCC citizens, 5 years for expatriate residents above 21 years, 1 year for expatriate residents below 21 years. In Dubai you can renew 6 months before expiry (3 months if under 21).",
   "weight": 70,
   "source": "ae_x_g_src_uae_dl",
   "verified": true,
   "form": "Driving licence renewal",
   "penalty": "Dubai: renewal delay fine of AED 10 per month from the licence expiry date, up to AED 500. A licence expired more than 10 years needs an evaluation test.",
   "note": "The late fine and early-renewal window were read on the Dubai RTA page only; other emirates (MOI, Abu Dhabi TAMM) were not readable as text (TAMM is a script-only page).",
   "roll": false
  },
  {
   "id": "ae_x_g_vehicle_renew",
   "name": "Renew your vehicle registration",
   "dept": "property",
   "head": "Vehicle",
   "authority": "Your emirate's traffic authority (RTA in Dubai)",
   "brief": "A vehicle registration lasts at most 12 months and must be renewed every year, with valid insurance and, where needed, a passed technical inspection. A vehicle may not be driven unless registered.",
   "why": "A vehicle is registered in your name.",
   "applies": {
    "q": "ae_x_g_vehicle",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every 12 months, by the expiry date of the registration (30-day grace period)"
   },
   "dueText": "As per the Federal Traffic Law, your vehicle registration is valid for a maximum of 12 months. After that, there's a 30-day grace period for renewal. You can renew up to 150 days before expiry.",
   "weight": 72,
   "source": "ae_x_g_src_rta_veh",
   "verified": true,
   "form": "Vehicle registration (Mulkiya) renewal",
   "penalty": "Dubai: late fees by vehicle category and length of delay; if not renewed within 2 months of expiry the Traffic File is blocked.",
   "note": "Read on the Dubai RTA page; the 12-month rule is stated as federal. The amount of the late fee is not given on the page. u.ae confirms a vehicle may not be driven unless registered.",
   "roll": false
  },
  {
   "id": "ae_x_g_eid_lost",
   "name": "Report a lost Emirates ID",
   "dept": "residency",
   "head": "Emirates ID",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "If your Emirates ID card is lost, you report the loss to ICP and ask for a replacement card.",
   "why": "You hold an Emirates ID.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_eid",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 7 days after you lose the card"
   },
   "dueText": "If you have lost your Emirates ID card, report the loss to ICP within 7 days from the date of loss.",
   "weight": 45,
   "source": "ae_x_g_src_eid",
   "verified": true,
   "form": "Issue a replacement for a lost/damaged ID card",
   "note": "The page does not state a penalty for reporting late. ICP's own \"ID card holder's duties\" page returned HTTP 500.",
   "roll": false
  },
  {
   "id": "ae_x_g_eid_change",
   "name": "Report a change in your personal details to ICP",
   "dept": "residency",
   "head": "Emirates ID",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "The holder of an Emirates ID tells ICP about any change in their personal details, such as a new passport, name, address or phone number.",
   "why": "You hold an Emirates ID.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_eid",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within one month after the change"
   },
   "dueText": "The Emirates ID card holder must report any change in his/her personal details to ICP within one month from the date of change.",
   "weight": 45,
   "source": "ae_x_g_src_eid",
   "verified": true,
   "form": "Update of Emirates ID data",
   "note": "No penalty is stated on the page.",
   "roll": false
  },
  {
   "id": "ae_x_g_abroad_180",
   "name": "Return before 180 days abroad, or your residence visa lapses",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "A resident who stays outside the UAE for more than 180 days in a row loses the residence visa automatically. Golden visa and green residence holders, investors, students abroad and some other groups are exempt.",
   "why": "You live in the UAE on a residence visa.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_res_visa",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 180 days after you leave the UAE (continuous stay abroad)"
   },
   "dueText": "If an expatriate resident lives outside the UAE for more than 180 days continuously, his/her residence visa will be nullified automatically.",
   "weight": 60,
   "source": "ae_x_g_src_resprov",
   "verified": true,
   "penalty": "The visa is cancelled. To come back the resident applies from abroad for an entry permit, with a valid reason, and pays AED 100 for every 30 days or less spent outside; then enters within 30 days of approval (not for Dubai residents).",
   "note": "Exceptions listed on the page include investors, students abroad, golden visa and green residence holders, residents abroad for treatment, and others excluded by ICP.",
   "roll": false
  },
  {
   "id": "ae_x_g_birth_reg",
   "name": "Register your baby's birth",
   "dept": "residency",
   "head": "Births",
   "authority": "Ministry of Health and Prevention or the emirate's health authority",
   "brief": "Parents who are residents register a child born in the UAE and get a birth certificate from the hospital or health authority.",
   "why": "A child has recently been born to you in the UAE.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_newborn",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after the birth"
   },
   "dueText": "Residents have a maximum period of 30 days to register their child's birth in the UAE.",
   "weight": 55,
   "source": "ae_x_g_src_baby",
   "verified": true,
   "form": "Birth certificate",
   "note": "No penalty for late birth registration is stated on the page.",
   "roll": false
  },
  {
   "id": "ae_x_g_newborn_visa",
   "name": "Get your newborn's residence visa and Emirates ID",
   "dept": "residency",
   "head": "Births",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "Resident parents arrange the baby's birth certificate, passport, Emirates ID and residence visa within 120 days of the birth.",
   "why": "A child has recently been born to you in the UAE.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_newborn",
      "yes": true
     },
     {
      "q": "ae_x_res_visa",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 120 days after the birth"
   },
   "dueText": "Residents have 120 days from the birth of their child to arrange the formal documents which includes birth certificates, passports, Emirates ID and visas of their newborn babies.",
   "weight": 65,
   "source": "ae_x_g_src_baby",
   "verified": true,
   "form": "Residence visa for a newborn",
   "penalty": "AED 100 for each day over the 120 days, and the baby will not be allowed to leave the country.",
   "roll": false
  },
  {
   "id": "ae_x_g_health_auh_employer",
   "name": "Health insurance for employees (Abu Dhabi)",
   "dept": "labour",
   "head": "Insurance",
   "authority": "Department of Health, Abu Dhabi",
   "brief": "In Abu Dhabi the employer provides health insurance for its employees and their families (one spouse and three children under 18), and a policy is required before a private-sector employee's residence permit is issued or renewed.",
   "why": "It employs staff in Abu Dhabi.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each employee's residence permit is issued or renewed, and kept valid while they work for you"
   },
   "dueText": "In the emirate of Abu Dhabi, employers and sponsors are responsible for providing health insurance coverage for their employees and their families (1 spouse and 3 children under 18 years). From 1 January 2025, employers are required to purchase health insurance policy as a prerequisite for applying for the issuance or renewal of residency permits.",
   "weight": 80,
   "source": "ae_x_g_src_hins",
   "verified": true,
   "form": "Employee health insurance policy",
   "note": "Penalty not stated on u.ae; the Department of Health Abu Dhabi site (doh.gov.ae) did not respond. For Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah and Fujairah the page says the mandate \"will extend\" to private-sector workers, with no date, so no item is given for them.",
   "roll": false
  },
  {
   "id": "ae_x_g_health_family",
   "name": "Health insurance for the family members you sponsor (Abu Dhabi and Dubai)",
   "dept": "residency",
   "head": "Health insurance",
   "authority": "Department of Health, Abu Dhabi; Dubai Health Authority",
   "brief": "In Abu Dhabi and Dubai a resident who sponsors family members must hold health insurance for them. A valid policy is needed when their residence visas are issued or renewed.",
   "why": "You sponsor family members' residence visas in Abu Dhabi or Dubai.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_sponsor_family",
      "yes": true
     },
     {
      "state": [
       "AZ",
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each family member's residence visa is issued or renewed, and kept valid throughout"
   },
   "dueText": "In the emirate of Abu Dhabi, employers and sponsors are responsible for providing health insurance coverage for their employees and their families. In the emirate of Dubai, sponsors are required to get insurance cover for their resident dependents.",
   "weight": 65,
   "source": "ae_x_g_src_hins",
   "verified": true,
   "form": "Health insurance policy for dependants",
   "note": "The u.ae page does not state the penalty or the exact moment the policy is checked for dependants; \"before the visa is issued or renewed\" is the general practice the page states for employees. Treat the timing as approximate.",
   "roll": false
  },
  {
   "id": "ae_x_g_health_domestic",
   "name": "Health insurance for your domestic worker (Abu Dhabi and Dubai)",
   "dept": "labour",
   "head": "Health insurance",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "Since 1 January 2025 an employer must buy a health insurance policy for a domestic worker before the worker's residence permit is issued or renewed. This is mandatory in Abu Dhabi and Dubai; the basic package costs AED 320 a year and the policy runs for two years.",
   "why": "You sponsor a domestic worker in Abu Dhabi or Dubai.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_domestic",
      "yes": true
     },
     {
      "state": [
       "AZ",
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the worker's residence permit is issued or renewed (policy valid for 2 years)"
   },
   "dueText": "From 1 January 2025, employers are required to purchase health insurance policy as a prerequisite for applying for the issuance or renewal of residency permits of private sector employees and domestic workers. The policy will be valid for two years.",
   "weight": 60,
   "source": "ae_x_g_src_hins",
   "verified": true,
   "form": "Health insurance policy (basic package)",
   "note": "Workers with work permits issued before 1 January 2024 that are still valid come under the rule at their next residency renewal. The page says the system \"will extend\" to the other five emirates, without a date.",
   "roll": false
  },
  {
   "id": "ae_x_g_lease_notice_dubai",
   "name": "Give 90 days' notice before ending or changing a Dubai lease",
   "dept": "property",
   "head": "Tenancy",
   "authority": "Dubai Land Department (RERA)",
   "brief": "In Dubai, a landlord or tenant who does not want to renew a lease, or wants to change any of its terms (for example the rent), must tell the other party at least 90 days before the lease ends, unless the lease says otherwise.",
   "why": "You are a landlord or tenant under a Dubai lease.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "q": "ae_x_g_tenant_dubai",
        "yes": true
       },
       {
        "q": "ae_x_g_landlord",
        "yes": true
       }
      ]
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "At least 90 days before the lease ends, if you will not renew or want to change its terms"
   },
   "dueText": "Where either of the two parties to a Lease Contract do not wish to renew the Lease Contract or wish to amend any of its terms, such party must notify the other party of such intent no less than ninety (90) days before the date on which the Lease Contract expires, unless otherwise agreed by the parties.",
   "weight": 50,
   "source": "ae_x_g_src_dxb_law26",
   "verified": true,
   "form": "Notice to the other party",
   "note": "Read in the English text of the 2007 law on the Dubai legislation portal; the amending Law No. (33) of 2008 could not be opened (404), so a later change to Article 14 was not ruled out. The law states no fine; without notice the lease cannot be ended or changed at renewal.",
   "roll": false
  },
  {
   "id": "ae_x_g_ejari",
   "name": "Register your Dubai lease with Ejari",
   "dept": "property",
   "head": "Tenancy",
   "authority": "Dubai Land Department (RERA)",
   "brief": "In Dubai the landlord registers every lease with the Dubai Land Department (Ejari), when it is signed and each time it is renewed. Registration is needed to connect water, electricity, gas and telecoms, and an unregistered lease cannot be relied on in a dispute.",
   "why": "You let out property in Dubai.",
   "applies": {
    "all": [
     {
      "q": "ae_x_g_landlord",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Each time a lease is signed or renewed, before utilities are connected"
   },
   "dueText": "In Dubai, landlords must register lease agreements with Dubai Land Department. Registration of lease contracts is compulsory to connect the utility services. All Lease Contracts will be registered with RERA (Law No. 26 of 2007, Art. 4).",
   "weight": 55,
   "source": "ae_x_g_src_lease",
   "verified": false,
   "form": "Ejari tenancy contract registration",
   "penalty": "No fine is stated; courts and government departments will not act on a lease that is not registered, and utilities cannot be connected.",
   "note": "Not verified: no official page read gives a time limit in days; the trigger (each new or renewed lease, needed for utilities) is stated. DLD fee: AED 100 to register a tenancy contract (dubailand.gov.ae service page).",
   "roll": false
  },
  {
   "id": "ae_x_g_tawtheeq",
   "name": "Register your Abu Dhabi lease in Tawtheeq",
   "dept": "property",
   "head": "Tenancy",
   "authority": "Department of Municipalities and Transport, Abu Dhabi",
   "brief": "In Abu Dhabi the landlord registers every lease in Tawtheeq, the emirate's tenancy register. Registration is needed to connect utilities; a municipality fee of 5% of the rent (or rental index, if higher) is then added to the tenant's utility bills.",
   "why": "You let out property in Abu Dhabi.",
   "applies": {
    "all": [
     {
      "q": "ae_x_g_landlord",
      "yes": true
     },
     {
      "state": [
       "AZ"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Each time a lease is signed or renewed, before utilities are connected"
   },
   "dueText": "In Abu Dhabi, landlords have to register lease contract in the Tawtheeq system. Registration of lease contracts is compulsory to connect the utility services.",
   "weight": 55,
   "source": "ae_x_g_src_lease",
   "verified": false,
   "form": "Tawtheeq tenancy contract registration",
   "note": "Not verified: no time limit is stated on u.ae, and the Abu Dhabi pages (TAMM, DMT) could not be read as text. No penalty read.",
   "roll": false
  },
  {
   "id": "ae_x_g_passport_renew",
   "name": "Renew your Emirati passport",
   "dept": "residency",
   "head": "Passport",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "An Emirati passport is valid for 10 years (5 years under age 21), or until its pages are used up, and can be renewed from six months before it expires, including from abroad through the UAEICP app.",
   "why": "You are a UAE citizen.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_citizen",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 10 years (5 years under 21), from 6 months before the expiry date on the passport"
   },
   "dueText": "The validity of the passport of UAE citizens aged 21 years and above, is 10 years from the date of issuance, or until all its pages are fully used, whichever happens earlier. For those under 21 years of age, validity is 5 years. A UAE-issued passport can be renewed, six months before its expiry date.",
   "weight": 55,
   "source": "ae_x_g_src_pp",
   "verified": true,
   "form": "Renewal of passport",
   "note": "No late fee is stated on the page; an expired passport cannot be used to travel.",
   "roll": false
  },
  {
   "id": "ae_x_g_tm_renew",
   "name": "Renew your trade mark registration",
   "dept": "ip",
   "head": "Trade marks",
   "authority": "Ministry of Economy and Tourism",
   "brief": "A UAE trade mark is protected for ten years at a time. It is renewed for another ten years during the last (tenth) year, or at the latest within six months after protection ends, at a higher fee.",
   "why": "You own a registered UAE trade mark.",
   "applies": {
    "q": "ae_x_g_trademark",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 10 years, during the tenth year of protection (at the latest 6 months after it ends)"
   },
   "dueText": "The renewal application must be submitted within the tenth year of the current protection period or at most 6 months after the end of the protection period.",
   "weight": 60,
   "source": "ae_x_g_src_tm",
   "verified": true,
   "form": "Renew Registration of Trademark",
   "penalty": "Renewing in the 6 months after expiry costs AED 6,500 instead of AED 5,750 (AED 9,750 instead of 8,250 for monitoring or inspection marks), plus AED 750 publication. The page does not say what happens after the 6 months.",
   "note": "\"Page was last updated on\" on moet.gov.ae shows the time of the visit, so no real update date could be recorded.",
   "roll": false
  },
  {
   "id": "ae_x_g_patent_annuity",
   "name": "Pay the annual fee on your patent or industrial design",
   "dept": "ip",
   "head": "Patents",
   "authority": "Ministry of Economy and Tourism",
   "brief": "A UAE patent (or industrial design or pending application) is kept alive by paying an annual fee at the start of each year of protection, counted from the application date. Fees rise every five years.",
   "why": "You own a UAE patent, industrial design or pending application.",
   "applies": {
    "q": "ae_x_g_patent",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, at the start of each year of protection counted from the application date (3-month grace period)"
   },
   "dueText": "The applicant shall pay the annual fee at the beginning of each year of the Continuation of Protection. The annual fee is calculated from application date. Late charges are imposed after the three month grace period.",
   "weight": 55,
   "source": "ae_x_g_src_pat",
   "verified": true,
   "form": "Paying Annuity Fee",
   "penalty": "Late charges after the 3-month grace period: AED 200 a month for individuals, AED 400 a month for companies. One MoET page caps them at AED 600 / 1,200 (3 months), another at AED 2,000 / 4,000. After 6 months from the due date the \"Pay Annual Fee\" page lists a \"retrieval of application\" step.",
   "note": "Fees: years 1-5 AED 100 (natural persons, SMEs, academia) or AED 200 (legal persons); 6-10 AED 500/1,000; 11-15 AED 1,250/2,500; 16-20 AED 2,000/4,000. The two MoET pages disagree on the cap of late charges. Cabinet Resolution No. 136 of 2026 exempts student inventors and people of determination from some fees (not checked in detail).",
   "roll": false
  },
  {
   "id": "ae_x_g_dm_ohs_pic",
   "name": "Keep a certified health and safety person in charge (Dubai), renewed every 2 years",
   "dept": "sector",
   "head": "Workplace safety",
   "authority": "Dubai Municipality",
   "brief": "Every business operating in Dubai appoints at least one certified Occupational Health and Safety Person in Charge for each work shift and each work location, and keeps the registration with Dubai Municipality up to date. The certificate is valid for two years and is renewed with a one-day refresher course.",
   "why": "It runs a workplace in Dubai.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "state": [
       "DU"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 2 years, before the end of the second year of the certificate"
   },
   "dueText": "All industries operating in the Emirate of Dubai shall appoint at least one (1) Certified OHS Person in Charge (PIC) for each work shift and each work location. The certificate is valid for a period of two (2) years. The OHS PIC shall renew the certification before the end of the second year of certification.",
   "weight": 55,
   "source": "ae_x_g_src_dm_pic",
   "verified": true,
   "form": "OHS Person in Charge (PIC) certification",
   "note": "No fine is stated in the scheme document. A PIC whose company gets grade D or F in a Dubai Municipality inspection may have the certificate cancelled. Whether free zone establishments fall under it was not checked. The item is shown to employers; a business with no staff may still need a PIC if the owner works on site.",
   "roll": false
  },
  {
   "id": "ae_x_g_fire_detectors",
   "name": "Install fire detectors in your house and subscribe to the civil defence system",
   "dept": "property",
   "head": "Home safety",
   "authority": "Ministry of Interior (Civil Defence)",
   "brief": "Owners of residential houses must install fire detecting devices and subscribe to the civil defence eSystem (Hassantuk). Owners of houses that existed in September 2020 had three years to do it; a new house needs it before its completion certificate is issued.",
   "why": "You own a residential house.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_house_owner",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Before the completion certificate of a new house; for existing houses the 3 years from September 2020 have passed"
   },
   "dueText": "Owners of residential houses are mandated to install fire detecting devices in their houses and subscribe to the civil defence eSystem as per a resolution approved by the UAE Cabinet in September 2020. Owners of existing houses have been granted three years from the issuance of the resolution.",
   "weight": 45,
   "source": "ae_x_g_src_fire",
   "verified": true,
   "form": "Hassantuk for homes",
   "note": "No penalty and no subscription renewal cycle are stated on the page. The government pays for installation in homes of people with limited income.",
   "roll": false
  },
  {
   "id": "ae_x_g_dom_wages",
   "name": "Pay your domestic worker's wage on time",
   "dept": "labour",
   "head": "Domestic workers",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "An employer pays a domestic worker the wage set in the ministry's standard contract, no later than 10 days after the date it falls due, through a channel the ministry approves.",
   "why": "You employ a domestic worker.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_domestic",
      "yes": true
     }
    ]
   },
   "frequency": "monthly",
   "due": {
    "t": "event",
    "text": "Within 10 days after each wage due date"
   },
   "dueText": "Domestic workers are entitled to payment of wages, as set out in the standard contract, within 10 days from due date.",
   "weight": 65,
   "source": "ae_x_g_src_dom",
   "verified": true,
   "form": "Wage payment under the standard contract",
   "note": "The page says penalty tables follow (Cabinet Resolution No. 106 of 2022), but they did not come through as text; the linked law PDFs downloaded empty. Ministerial Resolution No. 675 of 2022 brings certain domestic professions under the Wage Protection System (not read).",
   "roll": false
  },
  {
   "id": "ae_x_g_dom_ticket",
   "name": "Give your domestic worker a return ticket home every 2 years",
   "dept": "labour",
   "head": "Domestic workers",
   "authority": "Ministry of Human Resources and Emiratisation",
   "brief": "A domestic worker is entitled to a round-trip ticket to their home country every two years, along with paid annual leave of at least 30 days.",
   "why": "You employ a domestic worker.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_domestic",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 2 years of service"
   },
   "dueText": "Domestic workers are entitled to a round-trip ticket home every 2 years and paid annual leave of no less than 30 days.",
   "weight": 35,
   "source": "ae_x_g_src_dom",
   "verified": true,
   "note": "The page does not say from which date the two years run; the employment start date is assumed.",
   "roll": false
  },
  {
   "id": "ae_x_g_national_service",
   "name": "Enlist for national service",
   "dept": "residency",
   "head": "National service",
   "authority": "National and Reserve Service Authority (UAE Armed Forces)",
   "brief": "National service is mandatory for all medically fit Emirati men: 11 months for those with a high school diploma or more, three years otherwise. It can be postponed for study; an only son and medically unfit citizens are exempt.",
   "why": "You are an Emirati man of national service age who has not served.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_ns",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Before you reach 29 years of age, unless postponed or exempt"
   },
   "dueText": "Citizens who fail to enlist for military service without valid reason until they reach 29 years of age will face a jail term of one month to one year, or a fine ranging between AED 10,000 and AED 50,000 or both.",
   "weight": 60,
   "source": "ae_x_g_src_ns",
   "verified": true,
   "form": "National service enlistment",
   "penalty": "Jail of one month to one year, or a fine of AED 10,000 to AED 50,000, or both; the service must still be done even past age 30.",
   "note": "The page does not give the age at which a call-up or registration starts; postponement grounds include study (under 29, a course of two years or more).",
   "roll": false
  },
  {
   "id": "ae_x_vat_dereg",
   "name": "Deregister for VAT",
   "dept": "vat",
   "head": "Registration",
   "authority": "Federal Tax Authority",
   "brief": "A VAT registrant must apply to cancel its registration when it stops making taxable supplies, or when its taxable supplies over 12 consecutive months are below the voluntary registration threshold of AED 187,500. It pays all tax and penalties due and files a final return.",
   "why": "It is registered for VAT and has stopped making taxable supplies, or its taxable supplies have fallen below AED 187,500.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_vat_reg",
      "yes": true
     },
     {
      "any": [
       {
        "q": "ae_ceasing",
        "yes": true
       },
       {
        "q": "ae_x_vat_stop",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 20 business days after it stops making taxable supplies or falls below the threshold",
    "within": {
     "n": 20,
     "unit": "businessDays",
     "kind": "after"
    }
   },
   "dueText": "The Registrant must apply to the Authority for Tax deregistration in the cases mentioned in the Decree-Law, within 20 (twenty) Business Days of the occurrence of any of them (Executive Regulation, Article 14(1)). The cases are: if he stops making Taxable Supplies; or if the value of the Taxable Supplies made over a period of 12 consecutive months is less than the Voluntary Registration Threshold (Decree-Law, Article 21(1)).",
   "weight": 75,
   "source": "ae_x_src_vat_exec",
   "verified": true,
   "form": "VAT deregistration application",
   "note": "The business days are counted on Monday to Friday; official holidays are not worked out. Article 21(1)(b) also excepts a registrant whose taxable expenses still qualify it for voluntary registration. The Federal Tax Authority marks its English texts of the tax laws and regulations as unofficial translations (\"This is not an official translation\"); the Arabic text governs.",
   "roll": false
  },
  {
   "id": "ae_x_excise_dereg",
   "name": "Deregister for excise tax",
   "dept": "vat",
   "head": "Registration",
   "authority": "Federal Tax Authority",
   "brief": "An excise registrant applies to cancel its registration within 30 days of no longer being responsible for excise tax. One that stops importing, producing or stockpiling excise goods is no longer responsible from six months after it stopped, unless it shows the Authority it will restart within the next six months. All tax, penalties and returns due must be settled first.",
   "why": "It is registered for excise tax and has stopped the activities that made it register.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_excise",
      "yes": true
     },
     {
      "any": [
       {
        "q": "ae_ceasing",
        "yes": true
       },
       {
        "q": "ae_x_excise_stop",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 30 days after the date it is no longer responsible for excise tax (six months after it stopped the activity)",
    "within": {
     "n": 30,
     "unit": "days",
     "kind": "after"
    }
   },
   "dueText": "A Registrant shall make an application to the Authority for his Tax deregistration within (30) thirty days from the date he is no longer responsible for the Tax. A Registrant who ceases carrying out the activities is deemed not responsible for Tax from the day following the expiry of (6) six months from the date he ceased carrying out those activities, unless it is proven to the Authority that he intends to carry out these activities within the next (6) six months (Cabinet Decision No. 37 of 2017, Article 6(1) and (2)).",
   "weight": 70,
   "source": "excise_reg",
   "verified": true,
   "form": "Excise tax deregistration application",
   "note": "Enter the date the business stopped being responsible for excise tax (normally six months after it stopped), not the date it stopped. Read in the text with amendments to Cabinet Decision No. 198 of 2025. The Federal Tax Authority marks its English texts of the tax laws and regulations as unofficial translations (\"This is not an official translation\"); the Arabic text governs.",
   "roll": false
  },
  {
   "id": "ae_x_rakez_afs",
   "name": "Submit audited financial statements (RAKEZ)",
   "dept": "corporate",
   "head": "Accounts",
   "authority": "Ras Al Khaimah Economic Zone (RAKEZ)",
   "brief": "Every company incorporated in the RAKEZ jurisdiction prepares audited financial statements for each financial year, audited by a firm on RAKEZ's approved auditors list, and submits them to RAKEZ. They are not required at licence renewal.",
   "why": "It is a RAKEZ company.",
   "applies": {
    "all": [
     {
      "entity": [
       "fz"
      ]
     },
     {
      "state": [
       "RK"
      ]
     },
     {
      "q": "ae_x_fz_zone",
      "is": "rakez"
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 6
   },
   "dueText": "Within six (6) months from the end of its financial year.",
   "weight": 80,
   "source": "ae_x_src_rakez_faq",
   "verified": true,
   "form": "Audited financial statements submitted to RAKEZ",
   "penalty": "AED 2,500 if the audited financial statements are not submitted on time.",
   "note": "RAKEZ's standard articles set a January to December financial year; the first financial year may not be shorter than 6 months or longer than 18 months.",
   "roll": false
  },
  {
   "id": "ae_x_visa_renew_staff",
   "name": "Renew your employees' residence visas",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "The sponsor renews a residence visa before it expires. A business that sponsors its employees' visas renews each one in time, so the employee can go on living and working in the UAE legally.",
   "why": "The business sponsors its employees' residence visas.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "q": "ae_x_estcard",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each employee's residence visa expires"
   },
   "dueText": "Your sponsor must renew your residence visa before it expires. A renewed visa will let you continue living legally in the UAE without incurring fines or facing legal consequences for the same.",
   "weight": 62,
   "source": "ae_x_src_visa_gp26",
   "verified": true,
   "form": "Residence visa renewal for employees",
   "penalty": "Overstaying on a residence visa: AED 50 for each day.",
   "note": "An earlier renewal (one to six months before expiry) for travel needs ICP's approval first, the page says.",
   "roll": false
  },
  {
   "id": "ae_x_visa_cancel_staff",
   "name": "Cancel a departing employee's work permit and residence visa",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Ministry of Human Resources and Emiratisation; Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "When an employee leaves, the employer applies to the Ministry of Human Resources and Emiratisation to cancel the labour contract and labour card, signed by the employee with a letter confirming all wages were received, then applies to ICP to cancel the residence visa. The work permit is cancelled too.",
   "why": "The business sponsors its employees' residence visas.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "branch",
         "trust"
        ]
       },
       {
        "q": "ae_business",
        "yes": true
       }
      ]
     },
     {
      "q": "ae_employees",
      "yes": true
     },
     {
      "q": "ae_x_estcard",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "When an employee leaves (no time limit is stated)",
    "within": null
   },
   "dueText": "If a company decides to cancel an employment visa of its employee, it must first approach Ministry of Human Resources and Emiratisation with an application to cancel the employee's labour contract and labour card. The employee must also sign this application. Then, the employer should apply to ICP for visa cancellation. The company must also cancel the work permit.",
   "weight": 58,
   "source": "ae_x_src_visa_gp26",
   "verified": false,
   "form": "Labour contract and work permit cancellation, then residence visa cancellation",
   "note": "The page states the duty and the steps but no time limit, so the date is not counted: confirm it with the Ministry (mohre.gov.ae could not be opened: HTTP 503). The page describes an employer registered with the Ministry; a free zone employer follows its zone authority's procedure.",
   "roll": false
  },
  {
   "id": "ae_x_g_dependants_renew",
   "name": "Renew your family members' residence visas",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "A resident who sponsors a spouse, children or other family members renews their residence visas before they expire.",
   "why": "You sponsor family members' residence visas.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_sponsor_family",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before each family member's residence visa expires"
   },
   "dueText": "Your sponsor must renew your residence visa before it expires. A renewed visa will let you continue living legally in the UAE without incurring fines or facing legal consequences for the same.",
   "weight": 60,
   "source": "ae_x_src_visa_gp26",
   "verified": true,
   "form": "Residence visa renewal for dependants",
   "penalty": "Overstaying on a residence visa: AED 50 for each day.",
   "roll": false
  },
  {
   "id": "ae_x_g_dependants_cancel",
   "name": "Cancel your family members' visas before your own",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "brief": "A resident who sponsors a spouse, children or other family members and is leaving, or whose own visa is being cancelled, cancels the family members' visas first.",
   "why": "You sponsor family members' residence visas.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_g_sponsor_family",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before your own residence visa is cancelled"
   },
   "dueText": "An individual sponsoring his/her spouse, children and other dependents must cancel the dependents' visas before he cancels his/her own.",
   "weight": 50,
   "source": "ae_x_src_visa_gp26",
   "verified": true,
   "form": "Residence visa cancellation for dependants",
   "roll": false
  },
  {
   "id": "ae_x_g_visa_grace",
   "name": "Leave the UAE or get a new visa before the grace period ends",
   "dept": "residency",
   "head": "Residence visa",
   "authority": "Federal Authority for Identity, Citizenship, Customs and Port Security; GDRFA in Dubai",
   "brief": "After a residence visa is cancelled or expires, the holder may stay in the UAE for a grace period, then must leave or hold a new visa. Staying on after it is fined by the day.",
   "why": "You live in the UAE on a residence visa.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "ae_x_res_visa",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 days after your residence visa is cancelled or expires",
    "within": {
     "n": 60,
     "unit": "days",
     "kind": "after"
    }
   },
   "dueText": "GDRFA Dubai: after the cancellation or expiration of the residence permit there is a grace period of (60) sixty days during which you may remain in the country. u.ae: UAE residents are granted longer flexible grace periods that reach up to 6 months (according to resident category) to stay in the country after the residence permit is cancelled or expired.",
   "weight": 60,
   "source": "ae_x_src_gdrfa_cancel",
   "verified": false,
   "penalty": "Overstaying on a residence visa: AED 50 for each day.",
   "note": "Two official pages differ: GDRFA Dubai gives 60 days for all types of residence permits, u.ae says up to 6 months depending on the resident's category. The shorter, 60 days, is shown. The federal ICP page that lists the period for each category could not be read (it shows nothing without a script), so a category with a shorter period cannot be ruled out: confirm yours with ICP or GDRFA.",
   "roll": false
  }
 ],
 "sources": [
  {
   "id": "ae_x_src_emirat",
   "title": "Employing Emiratis in the private sector",
   "url": "https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/emiratis-employment-in-private-sector",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_hs",
   "title": "Health and safety at workplace",
   "url": "https://u.ae/en/information-and-services/jobs/Workplace-regulations/health-and-safety-at-workplace",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_permits",
   "title": "Work permits",
   "url": "https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/work-permits",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_gpssa_reg",
   "title": "Registration of an Insured",
   "url": "https://gpssa.gov.ae/pages/en/services/registration-insured",
   "publisher": "General Pension and Social Security Authority",
   "checked": "2026-11-12"
  },
  {
   "id": "ae_x_src_gpssa_faq",
   "title": "Frequently asked questions",
   "url": "https://gpssa.gov.ae/pages/en/help/faq",
   "publisher": "General Pension and Social Security Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_estcard",
   "title": "Renewal of Establishment Card",
   "url": "https://icp.gov.ae/en/services-details/?serviceid=64afe3c1035448005bd52e6e",
   "publisher": "Federal Authority for Identity, Citizenship, Customs and Port Security",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_eid",
   "title": "Emirates ID",
   "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/emirates-id",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_visa",
   "title": "General provisions for the residence visa",
   "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/Visa-information/general-provisions-for-the-residence-visa",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_dxb_health",
   "title": "Law No. (11) of 2013 Concerning Health Insurance in the Emirate of Dubai",
   "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Law%20No.%20(11)%20of%202013.html",
   "publisher": "Supreme Legislation Committee, Government of Dubai",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_dnfbp",
   "title": "Guidelines for Designated Non-Financial Businesses and Professions (March 2026)",
   "url": "https://www.moet.gov.ae/documents/20121/465917/DNFBP+Guidelines+-+March+2026.pdf/6e46414b-0878-bcf0-6054-235a86336f41",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_eocn",
   "title": "UN/UAE Sanctions Lists and targeted financial sanctions",
   "url": "https://www.uaeiec.gov.ae/en-us/un-page",
   "publisher": "Executive Office for Control and Non-Proliferation",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_dpms",
   "title": "Supplemental Guidance for Dealers in Precious Metals & Stones (March 2026)",
   "url": "https://www.moet.gov.ae/documents/20121/469920/Supplemental+Guidance+for+Dealers+in+Precious+Metals+%26+Stones+-+2026.pdf",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_rear",
   "title": "Supplemental Guidance for Real Estate Agents & Brokers (March 2026)",
   "url": "https://www.moet.gov.ae/documents/20121/469920/Supplemental+Guidance+for+Real+Estate+Agents+%26+Brokers+-+2026.pdf",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_ccl",
   "title": "Federal Decree-Law No. (32) of 2021 on Commercial Companies",
   "url": "https://www.moet.gov.ae/documents/20121/376326/Commercial+Companies.pdf/12d14f53-1a3e-47b4-8e70-fac3f672c403?t=1645596097819",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_difc_hb",
   "title": "Private Company - Non-Financial and Retail Handbook (DIFC-CS-GL-12 Rev.06)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/business-section-documents/starting-a-business/starting-a-business---hanbook-fees/non-financial-and-retail-checklist/private-company-non-financial-and-retail-handbook.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_difc_ubo",
   "title": "Ultimate Beneficial Ownership Regulations, Consolidated Version No. 2",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/laws--regulations/ultimate_beneficial_owners_regulations_updated_2024.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_difc_dp",
   "title": "Important FAQs on Data Protection & Privacy",
   "url": "https://www.difc.com/business/registrars-and-commissioners/commissioner-of-data-protection/faqs-glossary",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_difc_emp",
   "title": "Employment Law, DIFC Law No. 2 of 2019, Consolidated Version No. 5 (July 2025)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/laws--regulations/employment-law.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_acc",
   "title": "Annual accounts",
   "url": "https://www.adgm.com/operating-in-adgm/obligations-of-adgm-registered-entities/annual-filings/annual-accounts",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_dpfee",
   "title": "Data protection fees",
   "url": "https://www.adgm.com/operating-in-adgm/office-of-data-protection/fee-sections",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_bo",
   "title": "Beneficial Ownership and Control",
   "url": "https://www.adgm.com/operating-in-adgm/obligations-of-adgm-registered-entities/beneficial-ownership-and-control",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_breach",
   "title": "Personal Data Breach Notifications",
   "url": "https://www.adgm.com/operating-in-adgm/office-of-data-protection/data-breach-notifications",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_faq",
   "title": "Operating in ADGM: frequently asked questions",
   "url": "https://www.adgm.com/faqs/operating-in-adgm",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_dmcc_afs",
   "title": "Application guidelines: submission of audited financial statements and summary sheet",
   "url": "https://dmcc.ae/hubfs/website%20support%20documents/Guidelines-Audited%20Financial%20Statements%20Submission.pdf?hsLang=en",
   "publisher": "DMCC Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_jafza_audit",
   "title": "Audit Report Submission (FZE & FZCO)",
   "url": "https://www.jafza.ae/resource-centre/guides/audit-report-submission-fze-fzco/",
   "publisher": "Jebel Ali Free Zone",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adosh6",
   "title": "ADOSH-SF Mechanism 6.0: OSH Performance Monitoring and Reporting (Version 4.0)",
   "url": "https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/OSHAD-SF/Mechanisms/6----OSH-Performance--Eng.pdf",
   "publisher": "Abu Dhabi Public Health Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adosh11",
   "title": "ADOSH-SF Mechanism 11.0: Incident Notification, Investigation and Reporting (Version 4.0)",
   "url": "https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/OSHAD-SF/Mechanisms/11---Incident-Notification-Eng.pdf",
   "publisher": "Abu Dhabi Public Health Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_dc_guide",
   "title": "Dubai Customs Customer Guide",
   "url": "https://www.dubaicustoms.gov.ae/en/OpenData/Publications/Customer_Guide_Booklet_EN.pdf",
   "publisher": "Dubai Customs",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_adgm_er_guide",
   "title": "Guidance on the ADGM Employment Regulations 2024 (Employment Affairs Office)",
   "url": "https://assets.adgm.com/download/assets/ADGM+EAO+-+Guidance+-+ER+2024+(Feb+2025).pdf/ee708fc8edbe11efbfef7630b32848cb",
   "publisher": "Abu Dhabi Global Market",
   "checked": "2026-11-12"
  },
  {
   "id": "ae_y_cd75",
   "title": "Cabinet Decision No. 75 of 2023 and its amendments on the Administrative Penalties for Violations Related to the Application of Federal Decree-Law No. 47 of 2022",
   "url": "https://mof.gov.ae/wp-content/uploads/2024/03/Cabinet-Decision-No.-75-of-2023-and-its-amendments-on-the-Administrative-Penalties-for-Violations-Related-to-the-Application-of-Federal-Decree-Law-No.-47-of-2022.pdf",
   "publisher": "Ministry of Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_ctlaw",
   "title": "Federal Decree-Law No. 47 of 2022 on the Taxation of Corporations and Businesses, with amendments",
   "url": "https://mof.gov.ae/wp-content/uploads/2026/01/Federal-Decree-Law-No.-47-of-2022-and-its-amendments-en-v13.1.26.pdf",
   "publisher": "Ministry of Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_cd142",
   "title": "Cabinet Decision No. 142 of 2024 on the top-up tax on multinational enterprises",
   "url": "https://tax.gov.ae/Datafolder/Files/Legislation/Cabinet-Decision-No-142-of-2024-on-Top-up-Tax-on-MNEs.pdf",
   "publisher": "Federal Tax Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_law57",
   "title": "Federal Decree-Law No. 57 of 2023 regarding Pension and Social Security, and its amendments",
   "url": "https://pap-web-content.gpssa.gov.ae/pop/Documents/LawsEn/UAE%20Federal%20Law%20NO.%20(57)%20of%202023%20Regarding%20Pension%20&%20Social%20Security%20and%20Its%20Amendments%201.pdf",
   "publisher": "General Pension and Social Security Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_gpssa_gcc",
   "title": "GCC Overview: GCC Insurance Protection Extension Program",
   "url": "https://gpssa.gov.ae/pages/en/services/gcc-overview",
   "publisher": "General Pension and Social Security Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_uae_emir",
   "title": "Employing Emiratis in the private sector",
   "url": "https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/emiratis-employment-in-private-sector",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_uae_wp",
   "title": "Work permits",
   "url": "https://u.ae/en/information-and-services/jobs/Sector-of-employment/employment-in-the-private-sector/work-permits",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_difc_emp",
   "title": "Employment Law, DIFC Law No. 2 of 2019, Consolidated Version No. 5 (July 2025)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/laws--regulations/employment-law.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_difc_co",
   "title": "Companies Law, DIFC Law No. 5 of 2018, Consolidated Version (March 2022)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/laws--regulations/companies_law.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_difc_op",
   "title": "Operating Law, DIFC Law No. 7 of 2018, Consolidated Version (March 2022)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/familydocs/operating_law___name_penalty-(1).pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_difc_dp",
   "title": "Data Protection Law, DIFC Law No. 5 of 2020, Consolidated Version (July 2025)",
   "url": "https://assets.difc.com/v1/media/edge/images/dubaiintern0078-difcexperie96c5-production-3253/media/project/difcexperiences/difc/difcwebsite/documents/laws--regulations/data-protection-law.pdf",
   "publisher": "Dubai International Financial Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_adgm_circ",
   "title": "Registration Authority Circular No. (1) of 2023: Penalties for late filing of annual accounts",
   "url": "https://assets.adgm.com/download/assets/RA+CIRCULAR+NO+1+OF+2023.pdf/d203e7544fe411ef945c4aabc8854744",
   "publisher": "Abu Dhabi Global Market Registration Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_adosh6",
   "title": "ADOSH-SF Mechanism 6.0: OSH Performance Monitoring and Reporting (Version 4.0)",
   "url": "https://www.adphc.gov.ae/-/media/Project/ADPHC/ADPHC/PDF/OSHAD-SF/Mechanisms/6----OSH-Performance--Eng.pdf",
   "publisher": "Abu Dhabi Public Health Centre",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_dpmsr",
   "title": "Supplemental Guidance for Dealers in Precious Metals & Stones (2026)",
   "url": "https://www.moet.gov.ae/documents/20121/469920/Supplemental+Guidance+for+Dealers+in+Precious+Metals+%26+Stones+-+2026.pdf",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_rear",
   "title": "Supplemental Guidance for Real Estate Agents & Brokers (2026)",
   "url": "https://www.moet.gov.ae/documents/20121/469920/Supplemental+Guidance+for+Real+Estate+Agents+%26+Brokers+-+2026.pdf",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_cd132",
   "title": "Cabinet Resolution No. (132) of 2023 concerning the administrative penalties against violators of Cabinet Resolution No. (109) of 2023 (English text published by Dubai Humanitarian, a licensing registrar)",
   "url": "https://dubaihumanitarian.ae/wp-content/uploads/2025/09/Cabinet-Decision-No-132-of-2023-English.pdf",
   "publisher": "Dubai Humanitarian (International Humanitarian City), as registrar",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_goaml",
   "title": "Register in goAML",
   "url": "https://www.moet.gov.ae/en/registering-companies-in-goaml",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_y_adra25",
   "title": "Abu Dhabi Registration Authority (ADRA) launches initiative to update expired economic licences",
   "url": "https://www.mediaoffice.abudhabi/en/economy/abu-dhabi-registration-authority-adra-launches-initiative-to-update-expired-economic-licences-supporting-growth-and-investor-confidence/",
   "publisher": "Abu Dhabi Media Office (Government of Abu Dhabi)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_uae_dl",
   "title": "Getting a driving licence",
   "url": "https://u.ae/en/information-and-services/transportation/Driving-and-licensing/get-a-driving-licence",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_rta_veh",
   "title": "Renew and Amend Vehicle Data Ownership: Renew Vehicle Ownership",
   "url": "https://www.rta.ae/wps/portal/rta/ae/home/rta-services/service-details?serviceId=582",
   "publisher": "Roads and Transport Authority, Dubai",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_eid",
   "title": "Emirates ID",
   "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/emirates-id",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_resprov",
   "title": "General provisions for the residence visa",
   "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/Visa-information/general-provisions-for-the-residence-visa",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_baby",
   "title": "Having a baby",
   "url": "https://u.ae/en/information-and-services/social-affairs/Life-events/having-a-baby",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_hins",
   "title": "Getting a health insurance",
   "url": "https://u.ae/en/information-and-services/health-and-fitness/Healthcare-access-and-insurance/getting-a-health-insurance",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_dxb_law26",
   "title": "Law No. (26) of 2007 Regulating the Relationship between Landlords and Tenants in the Emirate of Dubai",
   "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(26)%20of%202007.html",
   "publisher": "Supreme Legislation Committee, Government of Dubai",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_lease",
   "title": "Leasing a property in the UAE",
   "url": "https://u.ae/en/information-and-services/moving-to-the-uae/leasing-a-property-in-the-uae",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_pp",
   "title": "The Emirati passport",
   "url": "https://u.ae/en/information-and-services/Passport-and-travel/The-UAE-Passport/The-Emirati-Passport",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_tm",
   "title": "Renew Registration of Trademark",
   "url": "https://www.moet.gov.ae/en/w/renew-registration-of-trademark",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_pat",
   "title": "Paying Annuity Fee",
   "url": "https://www.moet.gov.ae/en/w/request-for-paying-annuity-fee",
   "publisher": "Ministry of Economy and Tourism",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_dm_pic",
   "title": "Certification Scheme for OHS Person in Charge (PIC), DM-HSD-S2, version 1.0",
   "url": "https://dmpmedia.dm.gov.ae/uploads/2025/12/DM-HSD-S2_Certification-Scheme-for-OHS-PIC_V1.pdf",
   "publisher": "Dubai Municipality, Health and Safety Department",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_fire",
   "title": "Fire safety",
   "url": "https://u.ae/en/information-and-services/justice-safety-and-the-law/Safety/fire-safety",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_dom",
   "title": "Domestic helpers",
   "url": "https://u.ae/en/information-and-services/jobs/Workplace-regulations/domestic-helpers",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_g_src_ns",
   "title": "Armed forces (mandatory national service)",
   "url": "https://u.ae/en/information-and-services/justice-safety-and-the-law/Safety/armed-forces",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-11"
  },
  {
   "id": "ae_x_src_vat_exec",
   "title": "Cabinet Decision No. 52 of 2017 on the Executive Regulation of the VAT Decree-Law, with amendments to Cabinet Decision No. 149 of 2026 (unofficial translation)",
   "url": "https://tax.gov.ae/Datafolder/Files/Legislation/2026/Law-No-8-of-2017-and-its-amendments--09-2026.pdf",
   "publisher": "Federal Tax Authority",
   "checked": "2026-11-13"
  },
  {
   "id": "ae_x_src_rakez_faq",
   "title": "RAKEZ frequently asked questions: audited financial statements",
   "url": "https://rakez.com/en/faqs",
   "publisher": "Ras Al Khaimah Economic Zone (RAKEZ)",
   "checked": "2026-11-13"
  },
  {
   "id": "ae_x_src_visa_gp26",
   "title": "General provisions for the residence visa",
   "url": "https://u.ae/en/information-and-services/visa-and-emirates-id/Visa-information/general-provisions-for-the-residence-visa",
   "publisher": "UAE Government portal (u.ae)",
   "checked": "2026-11-13"
  },
  {
   "id": "ae_x_src_gdrfa_cancel",
   "title": "Cancellation of all types of residence permits",
   "url": "https://www.gdrfad.gov.ae/en/services/0613ab0e-5858-11ea-0320-0050569629e8",
   "publisher": "General Directorate of Identity and Foreigners Affairs, Dubai (GDRFA)",
   "checked": "2026-11-13"
  }
 ],
 "patches": {
  "ae_ct_return_offshore": {
   "verified": true,
   "source": "ae_y_ctlaw",
   "note": "The nine-month deadline is confirmed in the law. No official page names offshore companies; their inclusion still rests on the resident-person definition (incorporated under UAE legislation). The RAK ICC site, which has a corporate tax page, refused automated access (Incapsula bot check)."
  },
  "ae_sbr": {
   "penalty": "No separate penalty is set for the election itself. It is made in the corporate tax return, so a late return attracts the late-filing penalty: Late corporate tax return: AED 500 for each month or part of a month for the first twelve months, then AED 1,000 for each month or part of a month from the thirteenth month, counted from the day after the filing deadline (Cabinet Decision No. 75 of 2023, item 7).",
   "penaltySource": "ae_y_cd75",
   "note": "Cabinet Decision No. 75 of 2023 has no item for the Small Business Relief election as such; the figures are those for a late corporate tax return."
  },
  "ae_tp_disclosure": {
   "penalty": "The disclosure is filed with the corporate tax return (Art. 55(1) of the law). Late corporate tax return: AED 500 for each month or part of a month for the first twelve months, then AED 1,000 for each month or part of a month from the thirteenth month, counted from the day after the filing deadline (Cabinet Decision No. 75 of 2023, item 7). An incorrect return: AED 500, unless corrected before the filing deadline (item 9).",
   "penaltySource": "ae_y_cd75"
  },
  "ae_tp_files": {
   "penalty": "Failure to keep the records required by the Corporate Tax Law (which, in Art. 55(2), requires a master file and local file where the conditions are met): AED 10,000 for each violation, or AED 20,000 for each repeated violation within 24 months of the last one. Failure to submit tax records and documents in Arabic when requested: AED 5,000 (Cabinet Decision No. 75 of 2023, items 1 and 2).",
   "penaltySource": "ae_y_cd75",
   "note": "The decision has no separate item for handing the files over late after the 30-day request period; the general record-keeping item is the one that names records required by the Corporate Tax Law."
  },
  "ae_family_foundation": {
   "note": "FTA Decision No. 5 of 2025, Art. 10: confirmation within nine months of the end of the tax period (31 December 2025 for tax periods ended on or before 31 March 2025)."
  },
  "ae_dmtt_return": {
   "penalty": "Cabinet Decision No. 142 of 2024 applies Article 60 of the Corporate Tax Law (penalties are those set under the Tax Procedures Law and its implementing decisions) to the top-up tax. Transitional relief: for fiscal years beginning on or before 31 December 2026 (but not a fiscal year ending after 30 June 2028), no penalties or sanctions apply to the filing of a Top-up Tax Return or Pillar Two Information Return where the FTA considers the group took reasonable measures to apply the rules correctly. No penalty amounts specific to the top-up tax were found.",
   "penaltySource": "ae_y_cd142"
  },
  "ae_gpssa": {
   "penalty": "Late payment of contributions: an additional amount of 0.1% of the outstanding contributions for each day of delay, charged without warning or notice and capped at the amount of the outstanding contributions. Contributions not paid on the actual salary: an extra 10% of the outstanding contributions. Late registration of a UAE national (due within 30 days of joining): AED 200 for each day of delay. (Federal Decree-Law No. 57 of 2023, Art. 11.)",
   "penaltySource": "ae_y_law57"
  },
  "ae_gcc_pension": {
   "verified": true,
   "source": "ae_y_gpssa_gcc",
   "note": "The GPSSA page also says the employer share may not exceed the share set for UAE nationals, and lists each GCC country's rates and bank accounts."
  },
  "ae_difc_scheme": {
   "penalty": "Failure to pay the monthly Core Benefits to the Qualifying Scheme (or to register an employee within two months, among other duties in Art. 66): fine of up to USD 2,000 for each contravention in respect of each employee (Employment Law Schedule 2). Contributions count as late if not paid by the 21st day of the next calendar month.",
   "penaltySource": "ae_y_difc_emp",
   "dueText": "Monthly: the Core Benefits for each month must be paid to the Qualifying Scheme by the 21st day of the next calendar month.",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "monthly",
    "basis": "cal",
    "months": 1,
    "day": 21
   },
   "source": "ae_y_difc_emp",
   "note": null
  },
  "ae_licence": {
   "penalty": "Abu Dhabi: late renewal of an economic licence incurs late-renewal fines (amount not stated on the official pages read). Unrenewed licences are moved to an expired registry, and a licence expired for three years or more becomes subject to revocation. A waiver of outstanding late-renewal fines ran for three months until 15 August 2026.",
   "penaltySource": "ae_y_adra25",
   "note": "Penalty, Abu Dhabi only: the 2026 waiver (Abu Dhabi Media Office, 8 Sep 2026) exempted outstanding late-renewal fines \"which ran for three months until 15 August 2026\". The yearly renewal is stated only by the Sharjah Economic Development Department (\"Annual license renewal\"; \"you can renew up to 3 months before the expiry date\"; \"Pay before the end date to avoid penalties\"). Abu Dhabi's licensing page gives no term and Dubai's renewal page did not open (HTTP 503), so the term elsewhere is not confirmed."
  },
  "ae_licence_fz": {
   "note": "Example, DMCC only (its revised late renewal fee FAQ): expired 0-30 days AED 0; 31-60 days AED 2,500; 61-90 days AED 5,000; over 90 days the licence is terminated by the authority."
  },
  "ae_difc_renew": {
   "penalty": "Renewal up to 30 days after expiry: no fine. Later than 30 days: an automatic fine (maximum USD 25,000 for failing to renew the licence). Failing to file the Confirmation Statement with the renewal: automatic fine of up to USD 10,000. The Registrar may waive the fine on a late renewal.",
   "penaltySource": "ae_y_difc_op"
  },
  "ae_ubo": {
   "penalty": "Failure to establish the Register of Beneficial Owners and maintain its data: first time a written warning to correct within 30 days; second time AED 50,000 and a warning; third time AED 100,000. Failure to properly register beneficial ownership details: warning (15 days), then AED 20,000, then AED 40,000. On a third violation the Registrar may also suspend the commercial licence.",
   "penaltySource": "ae_y_cd132",
   "note": "Penalties are from the schedule to Cabinet Resolution No. 132 of 2023, read in an English copy published by Dubai Humanitarian (a Dubai licensing registrar), because moet.gov.ae served its legislation list only through a script and uaelegislation.gov.ae returned 403. Cabinet Decision No. 109 of 2023, Art. 18 (read on moet.gov.ae), confirms penalties come from a Cabinet list. Article 3(2): after a third violation the Registrar may also suspend the commercial licence and close the store until the fine is paid and the violation corrected."
  },
  "ae_ubo_change": {
   "penalty": "Failure to update the Register of Beneficial Owners: first time a written warning to correct within 15 days; second time AED 15,000 and a warning; third time AED 30,000. On a third violation the Registrar may also suspend the commercial licence.",
   "penaltySource": "ae_y_cd132",
   "note": "Penalties are from the schedule to Cabinet Resolution No. 132 of 2023, read in an English copy published by Dubai Humanitarian (a Dubai licensing registrar), because moet.gov.ae served its legislation list only through a script and uaelegislation.gov.ae returned 403. Cabinet Decision No. 109 of 2023, Art. 18 (read on moet.gov.ae), confirms penalties come from a Cabinet list. Article 3(2): after a third violation the Registrar may also suspend the commercial licence and close the store until the fine is paid and the violation corrected."
  },
  "ae_goaml": {
   "penalty": "Failure to register on goAML \"may result in severe penalties\" imposed by the Ministry of Economy and Tourism. The page gives no amount.",
   "penaltySource": "ae_y_goaml"
  },
  "ae_x_emiratisation_20_49": {
   "verified": true,
   "source": "ae_y_uae_emir",
   "note": "The page (updated 15 Oct 2026) still states targets only to the end of 2025 and gives the contributions for non-compliance: AED 96,000 in January 2025 for failing to hire one Emirati in 2024; AED 108,000 in January 2026 for failing to hire two Emiratis in 2025. No 2026 target is stated. mohre.gov.ae reset the connection on every attempt."
  },
  "ae_x_work_permit_renew": {
   "dueText": "Most work permits are valid for two years (a juvenile permit for one year, a national trainee permit for 12 months). Renew before the permit expires; renewal requires the issue conditions to be met, the documents provided and the fees paid by company classification.",
   "source": "ae_y_uae_wp",
   "note": "Our dueText says renewal requires settling fines for late issuance or non-renewal; on the current page (updated 19 Oct 2026) that step is listed under CANCELLING a work permit, not renewing. The page gives no renewal window. Fees for issue and renewal are AED 250 to AED 3,450 by company class (A, B or C)."
  },
  "ae_x_dpmsr": {
   "penalty": "Failure to submit a DPMSR within the predefined parameters and timelines exposes the dealer to enforcement action. The guidance gives no amount.",
   "penaltySource": "ae_y_dpmsr",
   "verified": true,
   "source": "ae_y_dpmsr",
   "note": "For a sale to a company, cash and wire transfers of AED 55,000 or more both count. For a sale to an individual, only cash of AED 55,000 or more counts. The guidance states no number of days for filing the report."
  },
  "ae_x_rear": {
   "penalty": "Failure to submit REARs within the predefined parameters and timelines may expose real estate agents and brokers to regulatory action. The guidance gives no amount.",
   "penaltySource": "ae_y_rear",
   "verified": true,
   "source": "ae_y_rear",
   "note": "Confirmed as stated; the time limit is still not given (uaefiu.gov.ae returned HTTP 403)."
  },
  "ae_x_difc_accounts": {
   "penalty": "A company that fails to comply with the accounts requirements of Art. 124 (including filing them with the Registrar) is liable to a fine of up to USD 10,000.",
   "penaltySource": "ae_y_difc_co",
   "verified": false,
   "note": "The DIFC Companies Law as read (consolidated March 2022) and the DIFC handbook of September 2026 give different periods for accounts. Confirm the period with the DIFC Registrar of Companies before relying on this date."
  },
  "ae_x_difc_accounts_small": {
   "penalty": "A company that fails to comply with the accounts requirements of Art. 124 is liable to a fine of up to USD 10,000.",
   "penaltySource": "ae_y_difc_co",
   "verified": false,
   "note": "The DIFC Companies Law as read (consolidated March 2022) and the DIFC handbook of September 2026 give different periods for accounts and the law exempts small private companies from filing. Confirm the period with the DIFC Registrar of Companies before relying on this date."
  },
  "ae_x_difc_changes": {
   "penalty": "Failing to notify the Registrar of a change in Registered Details: fine of up to USD 2,000 (Operating Law). Failing to file a special resolution (or other resolution or agreement under Art. 19) within 30 days: fine of up to USD 5,000 (Companies Law). Where no time limit is set, notices are due within 30 days of the event (Operating Regulations 7.2).",
   "penaltySource": "ae_y_difc_op",
   "note": "Maximum fines in USD. Other registers (e.g. directors and secretaries, Companies Law 82(5): up to USD 2,000; shareholders 44(2): up to USD 10,000) carry their own fines."
  },
  "ae_x_difc_final_pay": {
   "penalty": "The employee is entitled to a penalty equal to one daily wage for each day the employer is late with the payments due within 14 days of termination. It can only be awarded if a court holds the unpaid amount to exceed the employee's weekly wage, and a court waives it for any period while a dispute about the amount is pending or where the employee's unreasonable conduct caused the non-payment (Art. 19(2)-(4)).",
   "penaltySource": "ae_y_difc_emp",
   "note": null
  },
  "ae_x_difc_dp_notify": {
   "penalty": "Failing to register with the Commissioner by filing a notification of processing operations: fine of up to USD 25,000 (Data Protection Law, Schedule 2, Art. 14(7)).",
   "penaltySource": "ae_y_difc_dp",
   "note": null,
   "dueText": "Within 6 months from the incorporation date.",
   "source": "difc_handbook"
  },
  "ae_x_difc_dp_renew": {
   "penalty": "Art. 14(7) requires the notification to be \"kept up to date through amended notifications\"; failing to register in accordance with Art. 14(7): fine of up to USD 25,000.",
   "penaltySource": "ae_y_difc_dp",
   "note": "The Schedule 2 item names Art. 14(7) as a whole; no item names the annual renewal separately. The DIFC FAQ says the first DPO annual assessment is filed on the licence renewal date, which supports (but does not state) renewal with the licence."
  },
  "ae_x_difc_breach": {
   "penalty": "Failing to report a personal data breach in accordance with Art. 41: fine of up to USD 50,000.",
   "penaltySource": "ae_y_difc_dp"
  },
  "ae_x_adgm_accounts": {
   "penalty": "Non-compliance with the requirement to file annual accounts may result in regulatory action, including financial penalties of up to USD 15,000 against the company or LLP and against a director or partner, and/or cancellation of the commercial licence.",
   "penaltySource": "ae_y_adgm_circ",
   "note": "Circular dated 12 April 2023, citing section 416 of the Companies Regulations 2020. The Registrar may approve an extension if applied for before the due date (ADGM annual accounts page)."
  },
  "ae_x_adosh_quarterly": {
   "penalty": "An entity that fails to submit, or submits late, is sent an official letter. Missing the timescales for two consecutive reporting periods, or two or more in a calendar year, leads to a meeting with the sector regulatory authority (with top management present) to agree corrective action. Ongoing non-compliance leads the authority to review the entity's OSH management system approval certificate. No fine is stated.",
   "penaltySource": "ae_y_adosh6"
  },
  "ae_x_vat_dereg": {
   "penalty": "AED 1,000 for a late application, and AED 1,000 again on the same date every month, up to AED 10,000.",
   "penaltySource": "tax_penalties"
  },
  "ae_x_excise_dereg": {
   "penalty": "AED 1,000 for a late application, and AED 1,000 again on the same date every month, up to AED 10,000.",
   "penaltySource": "tax_penalties"
  }
 }
};
