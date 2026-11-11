// The non-tax duties of United States: company registry, employment, workplace safety, privacy and so on.
// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on 2026-11-11. Do not edit by hand:
// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.
import type { More } from '../more.ts';

export const more: More = {
 "version": "2026-11-11.720664f2",
 "step": {
  "id": "ops",
  "title": "What else applies to you",
  "desc": "Tick what is true. Each tick can add a duty outside tax: documents to renew, staff, records, licences, registers.",
  "checklist": true
 },
 "departments": [
  {
   "id": "privacy",
   "name": "Data breaches, privacy and marketing",
   "desc": "Deadlines for telling people and regulators about a data breach, and the federal rules for marketing email and sales calls."
  },
  {
   "id": "finance",
   "name": "Ownership, cash and investment reports",
   "desc": "Reports to FinCEN, the SEC, the FTC and the Bureau of Economic Analysis about owners, large cash payments, money raised from investors and foreign investment."
  },
  {
   "id": "ip",
   "name": "Trademarks, patents and copyright",
   "desc": "Filings and fees that keep a federal trademark, patent or online copyright protection alive."
  },
  {
   "id": "contracts",
   "name": "Federal contracts and grants",
   "desc": "Registrations and yearly reports for businesses that hold federal contracts or awards."
  },
  {
   "id": "labour",
   "name": "Employment, safety and benefits",
   "desc": "Hiring records and notices, OSHA injury logs and reports, and the filings of retirement and health plans."
  },
  {
   "id": "sector",
   "name": "Environment, transport and food",
   "desc": "EPA chemical and waste reports, motor carrier registrations and checks, and FDA food facility registration."
  },
  {
   "id": "personal",
   "name": "Personal documents and status",
   "desc": "Passports, green cards, Selective Service, address reports and state driver's licences and car registrations that must be renewed or updated on time."
  },
  {
   "id": "trade",
   "name": "Import and export",
   "desc": "Filings US Customs and the Census Bureau require from businesses that bring goods into or send goods out of the United States."
  }
 ],
 "questions": [
  {
   "id": "us_x_emp11",
   "step": "ops",
   "text": "Did the business have more than 10 employees at any time in the last calendar year?",
   "type": "yn",
   "help": "OSHA's injury and illness record keeping applies to employers with more than 10 employees. With 10 or fewer employees at all times during the last calendar year you do not keep these records unless OSHA or the Bureau of Labor Statistics tells you in writing. OSHA also exempts certain industries.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_est_size",
   "step": "ops",
   "text": "How many employees did your largest single workplace have at any time in the last calendar year?",
   "type": "choice",
   "help": "OSHA counts each establishment (a single physical location) separately when it decides who must send injury data online.",
   "options": [
    {
     "v": "u20",
     "label": "Fewer than 20"
    },
    {
     "v": "20to249",
     "label": "20 to 249"
    },
    {
     "v": "250plus",
     "label": "250 or more"
    }
   ],
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_osha_appa",
   "step": "ops",
   "text": "Is that workplace in an industry on OSHA's list for online injury reporting (appendix A to subpart E of 29 CFR part 1904)?",
   "type": "yn",
   "help": "Only asked for workplaces with 20 to 249 employees. OSHA's ITA Coverage Application on osha.gov/injuryreporting tells you whether your establishment must submit. If you have not checked, answer \"Not sure\".",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_emp20",
   "step": "ops",
   "text": "Did the business have 20 or more employees last year?",
   "type": "yn",
   "help": "COBRA covers group health plans of employers with at least 20 employees on more than 50 percent of their typical business days in the previous calendar year.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_emp50",
   "step": "ops",
   "text": "Does the business have 50 or more employees?",
   "type": "yn",
   "help": "The Family and Medical Leave Act covers private sector employers who employ 50 or more employees (in 20 or more workweeks). This counts all employees, not only full-time ones.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_emp100",
   "step": "ops",
   "text": "Does the business have 100 or more employees?",
   "type": "yn",
   "help": "The WARN Act (advance notice of plant closings and mass layoffs) applies to employers with 100 or more employees. Employees who worked fewer than six months in the last 12 months, or who average under 20 hours a week, are not counted.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_retirement_plan",
   "step": "ops",
   "text": "Does the business sponsor a retirement plan for employees, such as a 401(k) or a pension plan?",
   "type": "yn",
   "help": "A plan covered by ERISA brings a yearly Form 5500, a summary for participants and rules on how fast employee contributions are deposited.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_db_plan",
   "step": "ops",
   "text": "Is it a defined benefit pension plan covered by PBGC insurance?",
   "type": "yn",
   "help": "A plan that promises a set pension. Most private-sector defined benefit plans that meet tax qualification requirements are covered by the Pension Benefit Guaranty Corporation and pay it a yearly premium.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_health_plan",
   "step": "ops",
   "text": "Does the business offer a group health plan to employees?",
   "type": "yn",
   "help": "Medical coverage the employer sponsors, whether insured or self-funded. It brings COBRA notices, a yearly attestation to CMS and, when the plan covers prescription drugs, a Medicare Part D notice.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "labour"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_fed_contract",
   "step": "ops",
   "text": "Does the business hold a federal government contract or subcontract worth $200,000 or more?",
   "type": "yn",
   "help": "The Department of Labor's VETS-4212 page gives $200,000 as the current reporting threshold (one of its questions and answers still shows $150,000).",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "contracts"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_far_everify",
   "step": "ops",
   "text": "Does a federal contract of yours contain the FAR E-Verify clause?",
   "type": "yn",
   "help": "Federal contractors whose contract includes this clause must enroll in E-Verify and use it for new hires and for employees assigned to the contract. Look for the clause in the contract, or ask the contracting officer.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "contracts"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_fed_awards",
   "step": "ops",
   "text": "Does the business apply for federal contracts or grants directly, as the prime awardee?",
   "type": "yn",
   "help": "A prime awardee needs an active registration in SAM.gov. A business that only needs a Unique Entity ID, such as some sub-awardees, may not need to register.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "contracts"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_hipaa",
   "step": "ops",
   "text": "Is the business a HIPAA \"covered entity\" or a \"business associate\" of one?",
   "type": "yn",
   "help": "These are the two groups the HIPAA breach notification rule applies to. HHS explains who is covered on hhs.gov/hipaa (that site refused automated access during this research, so the definition was not read there). If unsure, answer \"Not sure\".",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_phr",
   "step": "ops",
   "text": "Does the business offer personal health records, or a related product or service, that is not covered by HIPAA?",
   "type": "yn",
   "help": "The FTC's Health Breach Notification Rule applies to vendors of personal health records (PHRs), PHR related entities and their third party service providers.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_ftc_fin",
   "step": "ops",
   "text": "Is the business a non-bank financial business, such as a tax preparation firm, mortgage broker or account servicer?",
   "type": "yn",
   "help": "The FTC's Safeguards Rule applies to financial institutions subject to the FTC's jurisdiction. The FTC's guide gives tax preparation firms and mortgage brokers among its examples.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_email_mkt",
   "step": "ops",
   "text": "Does the business send marketing or other commercial email?",
   "type": "yn",
   "help": "The CAN-SPAM Act covers all commercial messages, including business-to-business email.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_telemarket",
   "step": "ops",
   "text": "Does the business, or a company it hires, make telemarketing sales calls to consumers?",
   "type": "yn",
   "help": "Sellers and telemarketers must check their call lists against the National Do Not Call Registry.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_franchisor",
   "step": "ops",
   "text": "Does the business sell franchises?",
   "type": "yn",
   "help": "A franchisor must give buyers a disclosure document and keep it up to date under the FTC's Franchise Rule.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_regd",
   "step": "ops",
   "text": "Has the business sold shares, notes or other securities to investors under Regulation D?",
   "type": "yn",
   "help": "Form D is the notice of an exempt offering that Regulation D requires. Answer yes if the company has sold securities relying on Regulation D.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_regd_ongoing",
   "step": "ops",
   "text": "Is that offering still open more than 12 months after the Form D was filed?",
   "type": "yn",
   "help": "An ongoing offering needs a yearly amendment to Form D.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     },
     {
      "q": "us_x_regd",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_fdi_new",
   "step": "ops",
   "text": "Has a foreign person or company just acquired 10% or more of the business, set it up as a new US entity, or expanded it with a new facility?",
   "type": "yn",
   "help": "This triggers the BE-13 survey of new foreign direct investment. For an acquisition, Form BE-13A is required when the total cost is greater than $40 million.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_fdi10",
   "step": "ops",
   "text": "Is the business owned or controlled, directly or indirectly, by a foreign person or company?",
   "type": "yn",
   "help": "The Bureau of Economic Analysis counts a foreign voting interest of at least 10 percent as foreign direct investment.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_bea_contact",
   "step": "ops",
   "text": "Has the Bureau of Economic Analysis (BEA) contacted the business to file a survey?",
   "type": "yn",
   "help": "Some BEA surveys must be filed only by businesses BEA has contacted; others must be filed whether or not BEA has contacted you.",
   "show": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     },
     {
      "q": "us_x_fdi10",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_cash10k",
   "step": "ops",
   "text": "Does the business ever receive more than $10,000 in cash in one transaction or in related transactions?",
   "type": "yn",
   "help": "Any trade or business that receives this much cash must report it on Form 8300. The IRS page explains what counts as cash and as related transactions.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_msb",
   "step": "ops",
   "text": "Is the business a money services business (MSB) as FinCEN defines it?",
   "type": "yn",
   "help": "FinCEN's MSB registration page links to the definition. An MSB that is only an agent of another MSB does not register.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_hazchem",
   "step": "ops",
   "text": "Does a facility of yours store hazardous chemicals at or above the reporting amounts?",
   "type": "yn",
   "help": "Generally 10,000 pounds of a hazardous chemical for which a safety data sheet is required, or 500 pounds (or the threshold planning quantity, if lower) of an extremely hazardous substance. Retail gas stations have higher thresholds for gasoline (75,000 gallons) and diesel (100,000 gallons) stored entirely underground.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_tri",
   "step": "ops",
   "text": "Is a facility of yours in a TRI-covered industry sector, with 10 or more full-time employee equivalents, using a listed toxic chemical above the threshold?",
   "type": "yn",
   "help": "All three tests must be met. Ten full-time equivalents means 20,000 hours a year. The usual activity thresholds are 25,000 pounds manufactured or processed, or 10,000 pounds otherwise used, of a listed chemical in the year.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_lqg",
   "step": "ops",
   "text": "Is a site of yours a large quantity generator of hazardous waste?",
   "type": "yn",
   "help": "EPA's hazardous waste generator pages explain which sites count as large quantity generators. They file a report every two years.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_usdot",
   "step": "ops",
   "text": "Is the business a motor carrier with a USDOT number operating in interstate commerce?",
   "type": "yn",
   "help": "Motor carriers (and intermodal equipment providers) file Form MCS-150 before they begin operations and then update it every 24 months.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_ucr",
   "step": "ops",
   "text": "Does the business operate commercial motor vehicles across state lines, or work as a freight forwarder, broker or leasing company?",
   "type": "yn",
   "help": "These are the categories the Unified Carrier Registration (UCR) site asks about. Its \"Do I need to register?\" wizard gives the answer for your case.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_cdl",
   "step": "ops",
   "text": "Does the business employ drivers who hold a commercial driver's license (CDL)?",
   "type": "yn",
   "help": "Employers of CDL drivers must check FMCSA's Drug and Alcohol Clearinghouse before hiring a driver and once a year after that.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_trademark",
   "step": "ops",
   "text": "Does the business own a federally registered trademark?",
   "type": "yn",
   "help": "A registration at the US Patent and Trademark Office. It stays alive only if maintenance documents are filed on time.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust",
       "individual"
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
   "id": "us_x_tm_date",
   "step": "dates",
   "text": "On what date was the trademark registered?",
   "type": "date",
   "help": "The registration date on the certificate. Maintenance deadlines are counted from it.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust",
       "individual"
      ]
     },
     {
      "dept": [
       "ip"
      ]
     },
     {
      "q": "us_x_trademark",
      "yes": true
     }
    ]
   },
   "optional": true
  },
  {
   "id": "us_x_patent",
   "step": "ops",
   "text": "Does the business own a US patent that is subject to maintenance fees?",
   "type": "yn",
   "help": "Maintenance fees fall due three times after the patent is issued.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust",
       "individual"
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
   "id": "us_x_dmca",
   "step": "ops",
   "text": "Does your website or app let users post or store their own material, and have you designated a DMCA agent with the Copyright Office?",
   "type": "yn",
   "help": "Service providers that let users post or store material designate an agent to receive copyright takedown notices, to qualify for the DMCA safe harbor.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
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
   "id": "us_x_food_facility",
   "step": "ops",
   "text": "Does the business own or run a facility that manufactures, processes, packs or holds food for people or animals in the United States?",
   "type": "yn",
   "help": "Such facilities register with the Food and Drug Administration and renew the registration every two years.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "sector"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_unclaimed",
   "step": "ops",
   "text": "Is the business holding money or property that belongs to someone else and has gone unclaimed (uncashed cheques, customer credits, unpaid wages, dormant deposits)?",
   "type": "yn",
   "help": "Every state requires a business that holds such property to report it, and then hand it over, after a set time with no contact from the owner. Tick this if your books carry any.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust",
       "branch"
      ]
     },
     {
      "dept": [
       "state"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_personal_info",
   "step": "ops",
   "text": "Does the business hold personal information about customers, employees or other people (names with account, card, licence or Social Security numbers)?",
   "type": "yn",
   "help": "State laws require a business to tell the people affected, and often the state attorney general, when such information is exposed in a security breach.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust",
       "branch"
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
   "id": "us_x_g_passport",
   "step": "ops",
   "text": "Do you hold a US passport (book or card) issued when you were 16 or older?",
   "type": "yn",
   "help": "A US passport issued at age 16 or older is valid for 10 years from the date of issue.",
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
   "id": "us_x_g_child_passport",
   "step": "ops",
   "text": "Do you have a child under 16 who holds a US passport?",
   "type": "yn",
   "help": "A passport issued to a child under 16 is valid for 5 years and cannot be renewed: the child needs a new application.",
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
   "id": "us_x_g_sss",
   "step": "ops",
   "text": "Are you a man aged 18 through 25 who is a US citizen or lives in the United States?",
   "type": "yn",
   "help": "Almost all male US citizens and male immigrants aged 18 through 25 must register with Selective Service, including dual citizens and citizens living abroad.",
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
   "id": "us_x_g_green_card",
   "step": "ops",
   "text": "Do you hold a 10-year permanent resident card (green card)?",
   "type": "yn",
   "help": "Answer no if your card is a 2-year conditional card (based on a recent marriage or an investment): that card has its own rule.",
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
   "id": "us_x_g_conditional",
   "step": "ops",
   "text": "Do you hold a 2-year conditional green card based on marriage?",
   "type": "yn",
   "help": "A conditional card is valid for two years. To keep permanent residence you ask USCIS to remove the conditions on Form I-751.",
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
   "id": "us_x_g_noncitizen",
   "step": "ops",
   "text": "Do you live in the United States without being a US citizen?",
   "type": "yn",
   "help": "This includes green card holders and most visa holders. A and G visa holders and visa waiver visitors do not report a change of address.",
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
   "id": "us_x_g_dl",
   "step": "ops",
   "text": "Do you hold a driver's licence issued by your state?",
   "type": "yn",
   "help": "A licence issued by the state you picked at the start.",
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
   "id": "us_x_g_vehicle",
   "step": "ops",
   "text": "Do you own a vehicle registered in your state?",
   "type": "yn",
   "help": "A car, truck or motorcycle registered with the state's motor vehicle department.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
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
   "id": "us_x_g_turn65",
   "step": "ops",
   "text": "Are you turning 65 within the next 12 months and not yet signed up for Medicare?",
   "type": "yn",
   "help": "Your first chance to sign up lasts 7 months around your 65th birthday. If you or your spouse still have health coverage from a current job, you may be able to wait without a penalty.",
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
   "id": "us_x_g_import",
   "step": "ops",
   "text": "Does the business import goods into the United States (as the importer of record or the buyer causing them to arrive)?",
   "type": "yn",
   "help": "Goods brought in for sale or for use in the business, whether you clear them yourself or through a customs broker.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
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
   "id": "us_x_g_import_ocean",
   "step": "ops",
   "text": "Do any of those imports arrive by ocean vessel?",
   "type": "yn",
   "help": "The Importer Security Filing applies to cargo arriving in the United States by vessel.",
   "show": {
    "all": [
     {
      "q": "us_x_g_import",
      "yes": true
     },
     {
      "dept": [
       "trade"
      ]
     },
     {
      "q": "us_x_g_import",
      "yes": true
     }
    ]
   }
  },
  {
   "id": "us_x_g_import_food",
   "step": "ops",
   "text": "Does the business import food or animal feed into the United States?",
   "type": "yn",
   "help": "FDA needs prior notice of food, including animal feed, that is imported or offered for import.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
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
   "id": "us_x_g_export",
   "step": "ops",
   "text": "Does the business ship goods out of the United States worth more than $2,500 under one Schedule B (commodity) number, or goods that need an export licence?",
   "type": "yn",
   "help": "Electronic Export Information is filed in the Automated Export System for such shipments. The Schedule B number is the export commodity code.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
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
   "id": "us_x_g_ead",
   "step": "ops",
   "text": "Do you hold an Employment Authorization Document (EAD, the US work permit card)?",
   "type": "yn",
   "help": "The card USCIS issues on Form I-765 that shows you may work in the United States for a limited time.",
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
   "id": "us_x_g_casino",
   "step": "ops",
   "text": "Is the business a licensed casino or card club?",
   "type": "yn",
   "help": "Casinos and card clubs covered by the Bank Secrecy Act file suspicious activity reports and currency transaction reports with FinCEN.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "dept": [
       "finance"
      ]
     }
    ]
   }
  },
  {
   "id": "us_x_g_tm_madrid",
   "step": "ops",
   "text": "Is your US trademark protection an extension of an international (Madrid Protocol) registration?",
   "type": "yn",
   "help": "A mark protected in the US through WIPO's international registration system. Its US upkeep filing is the Section 71 declaration, not Section 8.",
   "show": {
    "all": [
     {
      "q": "us_x_trademark",
      "yes": true
     },
     {
      "dept": [
       "ip"
      ]
     },
     {
      "q": "us_x_trademark",
      "yes": true
     }
    ]
   }
  }
 ],
 "compliances": [
  {
   "id": "us_x_osha_log",
   "name": "Keep the OSHA injury and illness log",
   "dept": "labour",
   "head": "Injury records",
   "authority": "OSHA",
   "brief": "Employers with more than 10 employees write each recordable work-related injury or illness on the OSHA 300 Log and a 301 Incident Report, and keep the records for five years.",
   "why": "You had more than 10 employees at some time last year.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_emp11",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within seven calendar days of learning that a recordable injury or illness has occurred"
   },
   "dueText": "Enter each recordable injury or illness within seven (7) calendar days of receiving information that it has occurred. Keep the log, the annual summary and the incident reports for five (5) years following the end of the calendar year that the records cover.",
   "weight": 60,
   "source": "us_x_src_osha_1904_29",
   "verified": true,
   "form": "OSHA Forms 300 and 301",
   "note": "OSHA exempts certain industries from routine record keeping; the list was not read. The 10-employee exemption is in 29 CFR 1904.1 and the five-year rule in 29 CFR 1904.33, both read on osha.gov.",
   "roll": false
  },
  {
   "id": "us_x_osha_300a",
   "name": "Post the yearly summary of injuries and illnesses",
   "dept": "labour",
   "head": "Injury records",
   "authority": "OSHA",
   "brief": "At the end of each year the employer totals the OSHA 300 Log on the Form 300A summary, has a company executive certify it, and posts it in the workplace.",
   "why": "You keep OSHA injury and illness records.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_emp11",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      2,
      1
     ]
    ],
    "forYear": -1
   },
   "dueText": "Post the annual summary no later than February 1 of the year following the year covered by the records, and keep it posted until April 30.",
   "weight": 65,
   "source": "us_x_src_osha_1904_32",
   "verified": true,
   "form": "OSHA Form 300A",
   "roll": false
  },
  {
   "id": "us_x_osha_ita",
   "name": "Send injury and illness data to OSHA online",
   "dept": "labour",
   "head": "Injury records",
   "authority": "OSHA",
   "brief": "Larger workplaces, and mid-sized ones in listed industries, send their Form 300A figures to OSHA through its Injury Tracking Application once a year. Workplaces with 100 or more employees in a second list of industries also send Forms 300 and 301.",
   "why": "Your workplace is large enough, or in a listed industry, to be covered by OSHA's online reporting rule.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "any": [
       {
        "q": "us_x_est_size",
        "is": "250plus"
       },
       {
        "all": [
         {
          "q": "us_x_est_size",
          "is": "20to249"
         },
         {
          "q": "us_x_osha_appa",
          "yes": true
         }
        ]
       }
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      3,
      2
     ]
    ],
    "forYear": -1
   },
   "dueText": "Submit by March 2 of the year after the calendar year covered by the form(s). OSHA takes submissions from January 2 to March 2.",
   "weight": 55,
   "source": "us_x_src_osha_1904_41",
   "verified": true,
   "form": "Form 300A data through the Injury Tracking Application (ITA)",
   "note": "OSHA's ITA Coverage Application (osha.gov/injuryreporting) says whether a given establishment must submit. That page also says establishments that missed the March 2, 2026 deadline must still submit.",
   "roll": false
  },
  {
   "id": "us_x_osha_severe",
   "name": "Report a work-related death or severe injury to OSHA",
   "dept": "labour",
   "head": "Accident reports",
   "authority": "OSHA",
   "brief": "Every employer under OSHA's jurisdiction must tell OSHA quickly when a worker dies on the job, is admitted to hospital, loses a limb or loses an eye. This applies even to small employers that keep no injury log.",
   "why": "You have employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 8 hours of a work-related death; within 24 hours of an in-patient hospitalization, amputation or loss of an eye"
   },
   "dueText": "A fatality must be reported within 8 hours. An in-patient hospitalization, amputation, or eye loss must be reported within 24 hours.",
   "weight": 75,
   "source": "us_x_src_osha_report",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_posters",
   "name": "Display the required federal workplace posters",
   "dept": "labour",
   "head": "Workplace notices",
   "authority": "U.S. Department of Labor",
   "brief": "Federal law makes employers put up certain notices where staff can see them: the minimum wage (FLSA) poster, the OSHA job safety poster, the polygraph protection notice and, for employers with 50 or more employees, the family and medical leave poster. Federal contractors have more.",
   "why": "You have employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Put the posters up when you first have employees and keep them posted"
   },
   "dueText": "No filing date: the posters must be displayed in the workplace, where workers can easily see them, for as long as you have employees.",
   "weight": 55,
   "source": "us_x_src_dol_posters",
   "verified": true,
   "penalty": "It depends on the poster. The Department of Labor's page says failing to post the OSHA poster can bring a citation and penalty, while there are no citations or penalties for failing to post the FLSA minimum wage poster.",
   "note": "States have their own poster requirements, which are not covered here.",
   "roll": false
  },
  {
   "id": "us_x_i9",
   "name": "Check each new hire's right to work",
   "dept": "labour",
   "head": "Hiring",
   "authority": "U.S. Citizenship and Immigration Services (USCIS)",
   "brief": "For every person hired, the employee fills in Section 1 of Form I-9 and the employer examines their identity and work-authorization documents and completes Section 2. The form is kept by the employer, not sent to the government.",
   "why": "You hire employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Section 1 by the employee's first day of employment; Section 2 within three business days of the date employment begins"
   },
   "dueText": "The employee must complete Section 1 no later than the first day of employment. The employer must complete Section 2 within three business days of the date employment begins (on the first day, if the job lasts less than three business days). Keep each Form I-9 for three years after the date of hire or one year after the date employment ends, whichever is later.",
   "weight": 90,
   "source": "us_x_src_i9_s2",
   "verified": true,
   "form": "Form I-9",
   "penalty": "USCIS lists failing to comply with Form I-9 requirements as a civil violation; its page does not give the current dollar amounts.",
   "note": "The retention rule was read in section 10.0 of the same handbook (page last updated 2023-07-18).",
   "roll": false
  },
  {
   "id": "us_x_newhire",
   "name": "Report each new hire to the state directory",
   "dept": "labour",
   "head": "Hiring",
   "authority": "State Directory of New Hires",
   "brief": "Employers report each newly hired employee to their state's directory of new hires.",
   "why": "You hire employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's hire date"
   },
   "dueText": "Report new employees to the state directory within 20 days of the employee hire date.",
   "weight": 80,
   "source": "us_x_src_sba_hire",
   "verified": true,
   "note": "Read on the Small Business Administration's page. The federal child support office's own pages (acf.gov) refused automated access, so its details (what to report, rehires, penalties) were not read. A state may ask for the report sooner: check your state's new-hire reporting site.",
   "roll": false
  },
  {
   "id": "us_x_flsa_records",
   "name": "Keep payroll and time records",
   "dept": "labour",
   "head": "Records",
   "authority": "Wage and Hour Division, U.S. Department of Labor",
   "brief": "Every employer covered by the Fair Labor Standards Act must keep certain records for each non-exempt worker, and hold them for set periods.",
   "why": "You have employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Keep payroll records at least three years, and time cards and other wage computation records two years"
   },
   "dueText": "Preserve payroll records for at least three years. Records on which wage computations are based (such as time cards) should be retained for two years.",
   "weight": 50,
   "source": "us_x_src_flsa21",
   "verified": true,
   "note": "This is a record-keeping duty with no filing. The fact sheet is marked \"Revised July 2008\".",
   "roll": false
  },
  {
   "id": "us_x_eeoc_records",
   "name": "Keep personnel and hiring records for one year",
   "dept": "labour",
   "head": "Records",
   "authority": "U.S. Equal Employment Opportunity Commission",
   "brief": "EEOC regulations make employers keep all personnel or employment records for one year, and for one year from the date of termination when an employee is let go. Payroll records are kept for three years.",
   "why": "You have employees.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Keep each record for one year; one year from the date of termination for an employee who is let go"
   },
   "dueText": "Keep all personnel or employment records for one year. If an employee is involuntarily terminated, keep their personnel records for one year from the date of termination. If a charge is filed, keep the records until the final disposition of the charge or any lawsuit.",
   "weight": 40,
   "source": "us_x_src_eeoc_records",
   "verified": true,
   "note": "The size of employer each EEOC law covers was not read on this page.",
   "roll": false
  },
  {
   "id": "us_x_fmla_notice",
   "name": "Family and medical leave notices",
   "dept": "labour",
   "head": "Workplace notices",
   "authority": "Wage and Hour Division, U.S. Department of Labor",
   "brief": "When an employee asks for leave that may be covered by the Family and Medical Leave Act, the employer must tell them whether they are eligible and, later, whether the leave will be designated as FMLA leave. Covered employers must also keep the FMLA notice posted.",
   "why": "You employ 50 or more employees.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_emp50",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within five business days of the employee requesting leave"
   },
   "dueText": "Tell the employee whether they are eligible within five business days of the employee requesting leave, and notify the employee whether leave will be designated as FMLA leave within five business days.",
   "weight": 55,
   "source": "us_x_src_fmla_faq",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_warn",
   "name": "Advance notice of a plant closing or mass layoff",
   "dept": "labour",
   "head": "Layoffs",
   "authority": "U.S. Department of Labor",
   "brief": "Before closing a site or laying off a large group, a bigger employer must give written notice to the affected employees, their representatives, the local chief elected official and the state dislocated worker unit.",
   "why": "You have 100 or more employees.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_emp100",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "At least 60 calendar days before the plant closing or mass layoff"
   },
   "dueText": "Give at least 60 calendar days advance written notice of a plant closing and mass layoff.",
   "weight": 55,
   "source": "us_x_src_warn",
   "verified": true,
   "form": "WARN notice",
   "note": "The Department of Labor's page does not describe the penalties and says the Department has no enforcement role in seeking damages for workers. Some states have their own plant closure laws.",
   "roll": false
  },
  {
   "id": "us_x_5500",
   "name": "Annual return/report of an employee benefit plan",
   "dept": "labour",
   "head": "Benefit plan reports",
   "authority": "Department of Labor (EBSA), IRS and PBGC",
   "brief": "The yearly report on a retirement or welfare benefit plan covered by ERISA, filed online through the EFAST2 system. Small plans may be able to use the short Form 5500-SF.",
   "why": "You sponsor a retirement plan for employees.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_retirement_plan",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "cal",
    "months": 7
   },
   "dueText": "The last day of the seventh month after the plan year ends (July 31 for a calendar year plan). An extension can be requested on Form 5558.",
   "weight": 75,
   "source": "us_x_src_5500",
   "verified": true,
   "form": "Form 5500 or Form 5500-SF",
   "penalty": "$250 per day, not to exceed $150,000, for a late Form 5500 series return (IRS penalty).",
   "note": "The date shown assumes the plan year is the calendar year. One-participant plans file Form 5500-EZ with the IRS instead. Welfare plans (such as health plans) can also be required to file; the checker asks only about retirement plans.",
   "roll": false
  },
  {
   "id": "us_x_sar",
   "name": "Summary annual report to plan participants",
   "dept": "labour",
   "head": "Benefit plan reports",
   "authority": "Employee Benefits Security Administration, U.S. Department of Labor",
   "brief": "A short narrative summary of the Form 5500 that the plan administrator gives to participants and to beneficiaries receiving benefits.",
   "why": "You sponsor a retirement plan that files Form 5500.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_retirement_plan",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "cal",
    "months": 9
   },
   "dueText": "Within 9 months after the end of the plan year, or 2 months after the due date for filing Form 5500 (with an approved extension).",
   "weight": 45,
   "source": "us_x_src_ebsa_guide",
   "verified": true,
   "form": "Summary Annual Report (SAR)",
   "note": "The date shown assumes the plan year is the calendar year. The guide is dated December 2022.",
   "roll": false
  },
  {
   "id": "us_x_401k_deposit",
   "name": "Deposit employees' retirement contributions promptly",
   "dept": "labour",
   "head": "Benefit plan deposits",
   "authority": "Employee Benefits Security Administration, U.S. Department of Labor",
   "brief": "Money withheld from employees' pay for a 401(k) or similar plan must be moved into the plan quickly.",
   "why": "You withhold employee contributions for a retirement plan.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_retirement_plan",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as the contributions can reasonably be separated from company assets, and no later than the 15th business day of the month following the payday"
   },
   "dueText": "As soon as it is reasonably possible to separate them from the company's assets, but no later than the 15th business day of the month following the payday. For plans with fewer than 100 participants, contributions deposited no later than the 7th business day following withholding by the employer are treated as timely.",
   "weight": 65,
   "source": "us_x_src_erisa_faq",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_pbgc",
   "name": "PBGC premium filing",
   "dept": "labour",
   "head": "Benefit plan reports",
   "authority": "Pension Benefit Guaranty Corporation",
   "brief": "Every defined benefit pension plan covered by PBGC insurance files premium information and pays its premium once a year.",
   "why": "You sponsor a defined benefit pension plan covered by PBGC.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_db_plan",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      15
     ]
    ]
   },
   "dueText": "Premiums are due on the 15th day of the 10th full calendar month in the plan year (October 15th for calendar-year plans). If the date falls on a weekend or federal holiday it moves to the next business day.",
   "weight": 45,
   "source": "us_x_src_pbgc",
   "verified": true,
   "form": "Comprehensive premium filing (through My PAA)",
   "penalty": "Late charges include both interest and penalty.",
   "note": "The date shown assumes a calendar plan year. Special dates apply to new plans, changed plan years and plans in a standard termination. Who must file was read in PBGC's Comprehensive Premium Filing Instructions for 2026 plan years.",
   "roll": false
  },
  {
   "id": "us_x_cobra",
   "name": "COBRA health coverage notices",
   "dept": "labour",
   "head": "Health plan notices",
   "authority": "Employee Benefits Security Administration, U.S. Department of Labor",
   "brief": "When an employee loses group health coverage because they leave, have their hours cut or die, the employer tells the plan, and the plan offers the employee and family the chance to elect continuation (COBRA) coverage.",
   "why": "You offer a group health plan and had 20 or more employees last year.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_health_plan",
      "yes": true
     },
     {
      "q": "us_x_emp20",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Notify the plan within 30 days after the qualifying event; the plan sends the election notice within 14 days after that"
   },
   "dueText": "The employer must notify the plan within 30 days after a termination, reduction in hours, death, Medicare entitlement or employer bankruptcy. The plan must then provide an election notice to qualified beneficiaries within 14 days. Employees and spouses get a general notice within the first 90 days of coverage, and each qualified beneficiary has at least 60 days to elect.",
   "weight": 60,
   "source": "us_x_src_cobra",
   "verified": true,
   "note": "The Department of Labor's Reporting and Disclosure Guide adds that an employer that is also the plan administrator has 44 days after the qualifying event to provide the election notice.",
   "roll": false
  },
  {
   "id": "us_x_gag_clause",
   "name": "Gag clause compliance attestation",
   "dept": "labour",
   "head": "Health plan reports",
   "authority": "Centers for Medicare & Medicaid Services",
   "brief": "Group health plans and health insurance issuers must submit, once a year, an attestation that they comply with the federal prohibition on gag clauses.",
   "why": "You offer a group health plan.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_health_plan",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      12,
      31
     ]
    ]
   },
   "dueText": "Attestations are due by December 31 of each year (the first was due no later than December 31, 2023).",
   "weight": 45,
   "source": "us_x_src_gag",
   "verified": true,
   "form": "Gag Clause Prohibition Compliance Attestation",
   "note": "The page was last modified on 2024-09-19. Ask your insurer or plan administrator whether it submits the attestation for your plan.",
   "roll": false
  },
  {
   "id": "us_x_partd_notice",
   "name": "Medicare Part D creditable coverage notice",
   "dept": "labour",
   "head": "Health plan notices",
   "authority": "Centers for Medicare & Medicaid Services",
   "brief": "A group health plan that covers prescription drugs gives its Medicare-eligible members a written notice each year about whether that drug coverage is \"creditable\", and discloses the same to CMS.",
   "why": "You offer a group health plan that covers prescription drugs.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_health_plan",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      14
     ]
    ]
   },
   "dueText": "Give the notice prior to October 15th each year. The Disclosure to CMS form is due no later than 60 days from the beginning of a plan year, and within 30 days after the drug plan ends or its creditable coverage status changes.",
   "weight": 45,
   "source": "us_x_src_partd",
   "verified": true,
   "note": "The date shown is October 14, the last day that is \"prior to October 15th\". It applies only if the health plan includes prescription drug coverage. Page last modified 2024-09-10.",
   "roll": false
  },
  {
   "id": "us_x_hipaa_breach",
   "name": "Tell people about a breach of their health information (HIPAA)",
   "dept": "privacy",
   "head": "Data breach",
   "authority": "HHS Office for Civil Rights",
   "brief": "A HIPAA covered entity that discovers a breach of unsecured protected health information must notify each person affected. For a breach involving 500 or more people it notifies the Secretary of HHS at the same time. A business associate must notify the covered entity.",
   "why": "You are a HIPAA covered entity or business associate.",
   "applies": {
    "q": "us_x_hipaa",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay and no later than 60 calendar days after discovery of the breach"
   },
   "dueText": "Without unreasonable delay and in no case later than 60 calendar days after discovery of a breach.",
   "weight": 60,
   "source": "us_x_src_hipaa_404",
   "verified": true,
   "note": "hhs.gov refused automated access (HTTP 403), so this was read in the Code of Federal Regulations on govinfo.gov (2025 annual edition, dated 2025-10-01) and not on HHS's own guidance page. Penalties were not read.",
   "roll": false
  },
  {
   "id": "us_x_hipaa_annual",
   "name": "Yearly report to HHS of smaller health-information breaches",
   "dept": "privacy",
   "head": "Data breach",
   "authority": "HHS Office for Civil Rights",
   "brief": "Breaches of unsecured protected health information involving fewer than 500 people are logged during the year and reported to the Secretary of HHS once a year.",
   "why": "You are a HIPAA covered entity.",
   "applies": {
    "q": "us_x_hipaa",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "cal",
    "days": 60
   },
   "dueText": "Not later than 60 days after the end of each calendar year, for breaches discovered during the preceding calendar year.",
   "weight": 40,
   "source": "us_x_src_hipaa_408",
   "verified": true,
   "note": "Read in the Code of Federal Regulations on govinfo.gov because hhs.gov refused automated access. It applies only in a year in which such a breach was discovered.",
   "roll": false
  },
  {
   "id": "us_x_ftc_hbnr",
   "name": "Health data breach notice (businesses outside HIPAA)",
   "dept": "privacy",
   "head": "Data breach",
   "authority": "Federal Trade Commission",
   "brief": "Personal health record businesses that are not covered by HIPAA must tell the people affected, the FTC and, for large breaches, the media when unsecured health information is breached.",
   "why": "You offer a personal health record or related product that is not covered by HIPAA.",
   "applies": {
    "q": "us_x_phr",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 calendar days after the breach is discovered"
   },
   "dueText": "Notify each affected person without unreasonable delay and within 60 calendar days after the breach is discovered. If 500 or more people are affected, notify the FTC at the same time; if fewer than 500, notify the FTC within 60 calendar days following the end of the calendar year.",
   "weight": 40,
   "source": "us_x_src_hbnr",
   "verified": true,
   "penalty": "A civil penalty of up to $53,088 per violation.",
   "roll": false
  },
  {
   "id": "us_x_safeguards",
   "name": "Report a data breach to the FTC (Safeguards Rule)",
   "dept": "privacy",
   "head": "Data breach",
   "authority": "Federal Trade Commission",
   "brief": "Financial businesses covered by the FTC's Safeguards Rule must tell the FTC about a security event that involves the unencrypted information of at least 500 consumers. The person in charge of the security program (the Qualified Individual) must also report in writing to the board or governing body at least once a year.",
   "why": "You are a financial business under the FTC's Safeguards Rule.",
   "applies": {
    "q": "us_x_ftc_fin",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as possible, and no later than 30 days after discovery of the event"
   },
   "dueText": "Notify the FTC as soon as possible, and no later than 30 days after discovery, of a notification event involving the unencrypted information of at least 500 consumers.",
   "weight": 50,
   "source": "us_x_src_safeguards",
   "verified": true,
   "note": "The guide also calls for annual penetration testing and system-wide vulnerability scans every six months where there is no continuous monitoring.",
   "roll": false
  },
  {
   "id": "us_x_canspam",
   "name": "Honor email opt-out requests (CAN-SPAM)",
   "dept": "privacy",
   "head": "Marketing",
   "authority": "Federal Trade Commission",
   "brief": "Commercial email must give recipients a way to opt out of future messages, and once someone opts out you must stop emailing them. The law makes no exception for business-to-business email.",
   "why": "You send commercial email.",
   "applies": {
    "q": "us_x_email_mkt",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 business days of each opt-out request"
   },
   "dueText": "Honor a recipient's opt-out request within 10 business days. The opt-out mechanism must be able to process requests for at least 30 days after you send the message.",
   "weight": 55,
   "source": "us_x_src_canspam",
   "verified": true,
   "penalty": "Each separate email in violation of the CAN-SPAM Act is subject to penalties of up to $53,088.",
   "roll": false
  },
  {
   "id": "us_x_dnc",
   "name": "Check call lists against the National Do Not Call Registry",
   "dept": "privacy",
   "head": "Marketing",
   "authority": "Federal Trade Commission",
   "brief": "Sellers and telemarketers must subscribe to the National Do Not Call Registry, remove registered numbers from their call lists and keep those lists current.",
   "why": "You make telemarketing sales calls to consumers.",
   "applies": {
    "q": "us_x_telemarket",
    "yes": true
   },
   "frequency": "monthly",
   "due": {
    "t": "event",
    "text": "At least every 31 days"
   },
   "dueText": "Synchronize your call lists with an updated version of the registry at least every 31 days.",
   "weight": 40,
   "source": "us_x_src_dnc",
   "verified": true,
   "penalty": "The FTC's page gives fines of up to $53,088 per violation; each call may count as a separate violation.",
   "note": "Registry data for up to five area codes is free; from October 1, 2026 the fee is $85 for each further area code, capped at $23,425 a year.",
   "roll": false
  },
  {
   "id": "us_x_8300",
   "name": "Report cash payments over $10,000",
   "dept": "finance",
   "head": "Cash reporting",
   "authority": "IRS and FinCEN",
   "brief": "A business that receives more than $10,000 in cash in one transaction, or in related transactions, reports it to the IRS and FinCEN and tells the customer in writing.",
   "why": "Your business receives large cash payments.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "trust"
      ]
     },
     {
      "q": "us_x_cash10k",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days after the date the cash transaction occurred"
   },
   "dueText": "File Form 8300 within 15 days after the date the cash transaction occurred. Give a written statement to each party named on the form by January 31 of the following year. Keep a copy for five years.",
   "weight": 60,
   "source": "us_x_src_8300",
   "verified": true,
   "form": "Form 8300",
   "penalty": "Penalties apply for failing to file on time or to give the written statement; the amounts are adjusted every year for inflation.",
   "note": "A business that must e-file other information returns (10 or more) must also e-file Form 8300.",
   "roll": false
  },
  {
   "id": "us_x_msb",
   "name": "Register as a money services business",
   "dept": "finance",
   "head": "Anti-money-laundering",
   "authority": "FinCEN",
   "brief": "Money services businesses register with the Department of the Treasury through FinCEN and renew the registration every two years.",
   "why": "You are a money services business.",
   "applies": {
    "q": "us_x_msb",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 180 days after the business is established; renewal every two years by December 31"
   },
   "dueText": "The registration form must be filed within 180 days after the date on which the MSB is established. Registration must be renewed every two years, by December 31. Re-registration is due not later than 180 days after a triggering event (a change in ownership or control, a transfer of more than 10 percent of voting power or equity, or a more than 50 percent increase in agents).",
   "weight": 45,
   "source": "us_x_src_msb",
   "verified": true,
   "form": "Registration of Money Services Business (filed online with FinCEN)",
   "penalty": "A civil penalty of up to $5,000 for each violation (each day a violation continues is a separate violation); a criminal fine and/or imprisonment for up to 5 years may be imposed.",
   "note": "The page shows no last-updated date.",
   "roll": false
  },
  {
   "id": "us_x_boi_update",
   "name": "Update or correct a beneficial ownership report",
   "dept": "finance",
   "head": "Ownership",
   "authority": "FinCEN",
   "brief": "A foreign company registered to do business in a US state that has filed a beneficial ownership report must file an updated or corrected report when the reported information changes or turns out to be wrong. US companies and US persons are exempt.",
   "why": "The business was formed abroad and registered to do business in a US state.",
   "applies": {
    "q": "us_formed_abroad",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "After any change to, or inaccuracy found in, the information reported (30 days, not confirmed for companies)"
   },
   "dueText": "FinCEN's Questions and Answers on the final rule (effective August 14, 2026) say reporting companies must update or correct the company's information by filing an updated or corrected BOI report. The 30-calendar-day period was read there only for individuals who are not US persons updating a FinCEN identifier.",
   "weight": 35,
   "source": "us_x_src_boi_qa",
   "verified": false,
   "form": "BOI report (updated or corrected)",
   "note": "Not confirmed: the number of days a reporting company has to file an updated or corrected report. The final rule's text on federalregister.gov and FinCEN's rule PDF both refused automated access. FinCEN's older FAQs and compliance guide are marked as possibly outdated.",
   "roll": false
  },
  {
   "id": "us_x_formd",
   "name": "Notice of an exempt securities offering",
   "dept": "finance",
   "head": "Raising money",
   "authority": "U.S. Securities and Exchange Commission",
   "brief": "A company that raises money from investors under Regulation D files a short notice with the SEC online. There is no SEC fee.",
   "why": "You sold securities under Regulation D.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "q": "us_x_regd",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 15 days after the first sale of securities in the offering"
   },
   "dueText": "Companies must file Form D within 15 days after the first sale of securities.",
   "weight": 50,
   "source": "us_x_src_formd",
   "verified": true,
   "form": "Form D",
   "roll": false
  },
  {
   "id": "us_x_formd_annual",
   "name": "Yearly amendment for an offering that is still open",
   "dept": "finance",
   "head": "Raising money",
   "authority": "U.S. Securities and Exchange Commission",
   "brief": "If a Regulation D offering goes on for more than a year, the Form D notice must be amended every year. An amendment is also needed when certain information changes.",
   "why": "Your Regulation D offering has been open for more than 12 months.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "q": "us_x_regd",
      "yes": true
     },
     {
      "q": "us_x_regd_ongoing",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Each year while the offering continues beyond 12 months"
   },
   "dueText": "An amendment to Form D is required annually if the offering is ongoing for more than 12 months.",
   "weight": 40,
   "source": "us_x_src_formd",
   "verified": true,
   "form": "Amendment to Form D",
   "note": "The page does not give the exact day the yearly amendment is due.",
   "roll": false
  },
  {
   "id": "us_x_franchise",
   "name": "Yearly update of the franchise disclosure document",
   "dept": "finance",
   "head": "Franchising",
   "authority": "Federal Trade Commission",
   "brief": "A franchisor must refresh its disclosure document, including audited financial statements, after each fiscal year, and may then use only the updated version.",
   "why": "You sell franchises.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "q": "us_x_franchisor",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "days": 120
   },
   "dueText": "Annual updates, including updated audited financial information, must be prepared within 120 days of the close of the fiscal year. Material changes are added within a reasonable time after the close of each quarter.",
   "weight": 40,
   "source": "us_x_src_franchise",
   "verified": true,
   "form": "Franchise Disclosure Document (FDD)",
   "note": "The FTC's compliance guide is dated May 2008. The disclosure document must reach a prospective franchisee at least 14 calendar days before they sign a binding agreement or pay.",
   "roll": false
  },
  {
   "id": "us_x_be13",
   "name": "Survey of new foreign direct investment",
   "dept": "finance",
   "head": "Foreign investment surveys",
   "authority": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "brief": "A mandatory, confidential report to the Bureau of Economic Analysis when a foreign owner buys into, sets up or expands a US business.",
   "why": "A foreign person or company has just acquired, established or expanded the business.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "q": "us_x_fdi_new",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "No later than 45 days after the acquisition is completed, the new legal entity is established, or the expansion is begun"
   },
   "dueText": "No later than 45 days after the acquisition is completed, the new legal entity is established, or the expansion is begun.",
   "weight": 45,
   "source": "us_x_src_bea_fdi",
   "verified": true,
   "form": "Form BE-13",
   "penalty": "Whoever fails to report may be subject to a civil penalty and to injunctive relief; whoever willfully fails to report shall be fined and, if an individual, may be imprisoned for not more than one year.",
   "note": "The $40 million threshold and the penalty wording were read on Form BE-13A (rev. 10/2025), which covers acquisitions; check the BE-13 form that matches a new entity or an expansion.",
   "roll": false
  },
  {
   "id": "us_x_be15",
   "name": "Annual survey of foreign direct investment in the United States",
   "dept": "finance",
   "head": "Foreign investment surveys",
   "authority": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "brief": "A yearly mandatory survey of US businesses that are owned or controlled by a foreign person or company. It is filed online only.",
   "why": "The business is foreign-owned and BEA has contacted it.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "q": "us_x_fdi10",
      "yes": true
     },
     {
      "q": "us_x_bea_contact",
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
    ],
    "forYear": -1
   },
   "dueText": "The 2025 survey (fiscal year 2025) was due May 31, 2026. Filing requirement also subject to contact by BEA.",
   "weight": 40,
   "source": "us_x_src_bea_fdi",
   "verified": false,
   "form": "Form BE-15",
   "note": "Not confirmed: the due date of the next (2026) survey, which BEA had not yet published. The 2024 and 2025 surveys were both due May 31 (the 2024 survey allowed June 30 for eFile), so the date shown repeats May 31.",
   "roll": false
  },
  {
   "id": "us_x_be11",
   "name": "Annual survey of US direct investment abroad",
   "dept": "finance",
   "head": "Foreign investment surveys",
   "authority": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "brief": "A yearly mandatory survey of US businesses that have foreign affiliates. Form BE-11A covers the US business; further forms cover larger foreign affiliates.",
   "why": "The business owns 10% or more of a foreign company or partnership.",
   "applies": {
    "all": [
     {
      "kind": [
       "partnership",
       "corporation",
       "llc"
      ]
     },
     {
      "any": [
       {
        "q": "us_foreign_corp",
        "yes": true
       },
       {
        "q": "us_foreign_pship",
        "yes": true
       }
      ]
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
    ],
    "forYear": -1
   },
   "dueText": "The 2025 annual survey was due May 31, 2026.",
   "weight": 35,
   "source": "us_x_src_bea_dia",
   "verified": false,
   "form": "Form BE-11",
   "note": "Not confirmed: whether a business must file when BEA has not contacted it and none of its affiliates reaches the thresholds, and the due date of the next (2026) survey. BEA's separate five-yearly benchmark surveys (BE-10 for fiscal year 2024, due May 30 or June 30, 2025) have passed; the next one had not been announced on the page.",
   "roll": false
  },
  {
   "id": "us_x_tier2",
   "name": "Hazardous chemical inventory report",
   "dept": "sector",
   "head": "Chemical reporting",
   "authority": "U.S. Environmental Protection Agency, with state and local emergency planning bodies",
   "brief": "Facilities that keep hazardous chemicals above set amounts report what they store, and where, to the state emergency response commission, the local emergency planning committee and the local fire department.",
   "why": "You store hazardous chemicals above the reporting amounts.",
   "applies": {
    "q": "us_x_hazchem",
    "yes": true
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
   "dueText": "By March 1 of each year, for chemicals on site during the previous calendar year.",
   "weight": 50,
   "source": "us_x_src_tier2",
   "verified": true,
   "form": "Tier II form (Tier I in a few places)",
   "note": "Each state has its own Tier II filing procedure, and some charge fees; see EPA's page of state Tier II requirements.",
   "roll": false
  },
  {
   "id": "us_x_tri",
   "name": "Toxics Release Inventory report",
   "dept": "sector",
   "head": "Chemical reporting",
   "authority": "U.S. Environmental Protection Agency",
   "brief": "Facilities in covered industries that make, process or use listed toxic chemicals above set amounts report their releases and waste management each year, to EPA and to the state or tribe.",
   "why": "Your facility meets the three TRI tests.",
   "applies": {
    "q": "us_x_tri",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      7,
      1
     ]
    ],
    "forYear": -1
   },
   "dueText": "The data are due by July 1 and cover activities during the previous calendar year (July 1, 2026 for reporting year 2025).",
   "weight": 40,
   "source": "us_x_src_tri",
   "verified": true,
   "form": "TRI Form R (or the shorter Form A)",
   "penalty": "Incorrect or incomplete reporting may result in enforcement actions and fines.",
   "note": "The employee and sector tests were read in EPA's \"Basic TRI Reporting Concepts\" for reporting year 2025 (the penalty link).",
   "roll": false
  },
  {
   "id": "us_x_biennial_hw",
   "name": "Biennial hazardous waste report",
   "dept": "sector",
   "head": "Hazardous waste",
   "authority": "U.S. Environmental Protection Agency",
   "brief": "Large quantity generators of hazardous waste must submit a report every two years.",
   "why": "Your site is a large quantity generator of hazardous waste.",
   "applies": {
    "q": "us_x_lqg",
    "yes": true
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
    "years": "even",
    "forYear": -1
   },
   "dueText": "By March 1 of every even-numbered year, covering the previous calendar year (the report due March 1, 2026 covered 2025).",
   "weight": 40,
   "source": "us_x_src_bhw",
   "verified": true,
   "form": "EPA Form 8700-13 A/B",
   "note": "Filed every two years, not every year.",
   "roll": false
  },
  {
   "id": "us_x_mcs150",
   "name": "Biennial update of motor carrier information",
   "dept": "sector",
   "head": "Motor carrier registration",
   "authority": "Federal Motor Carrier Safety Administration",
   "brief": "Every motor carrier with a USDOT number files Form MCS-150 before it begins operations and updates it every two years.",
   "why": "You are a motor carrier with a USDOT number.",
   "applies": {
    "q": "us_x_usdot",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every 24 months, in the month set by the last digit of the USDOT number and the year set by the next-to-last digit"
   },
   "dueText": "Before beginning operations, then every 24 months. The last digit of the USDOT number sets the month (1 = January through 9 = September, 0 = October), with filing due by the last day of that month. If the next-to-last digit is odd, file in every odd-numbered calendar year; if even, in every even-numbered year.",
   "weight": 50,
   "source": "us_x_src_mcs150",
   "verified": true,
   "form": "Form MCS-150",
   "penalty": "A person that fails to complete biennial updates is subject to the penalties prescribed in 49 U.S.C. 521(b)(2)(B) or 49 U.S.C. 14901(a), as appropriate, and deactivation of its USDOT Number.",
   "note": "fmcsa.dot.gov refused automated access (HTTP 403), so this was read in the Code of Federal Regulations on govinfo.gov (2025 annual edition, dated 2025-10-01). Any change FMCSA made after that date was not seen. Filed every two years.",
   "roll": false
  },
  {
   "id": "us_x_clearinghouse",
   "name": "Yearly drug and alcohol Clearinghouse check of CDL drivers",
   "dept": "sector",
   "head": "Drivers",
   "authority": "Federal Motor Carrier Safety Administration",
   "brief": "Employers of drivers with a commercial driver's license run a full query in FMCSA's Drug and Alcohol Clearinghouse before hiring a driver, and a query for every current CDL driver once a year.",
   "why": "You employ CDL drivers.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_cdl",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Once a year for each CDL driver employed, and before each new CDL driver is hired"
   },
   "dueText": "Conduct a full query as part of each pre-employment driver investigation, and query the Clearinghouse annually for all currently employed CDL drivers.",
   "weight": 45,
   "source": "us_x_src_clearinghouse",
   "verified": true,
   "form": "Clearinghouse query",
   "roll": false
  },
  {
   "id": "us_x_ucr",
   "name": "Unified Carrier Registration",
   "dept": "sector",
   "head": "Motor carrier registration",
   "authority": "Unified Carrier Registration Plan",
   "brief": "Interstate motor carriers, freight forwarders, brokers and leasing companies register and pay a fee each year, based on the number of commercial motor vehicles.",
   "why": "You operate commercial motor vehicles across state lines, or are a broker, freight forwarder or leasing company.",
   "applies": {
    "q": "us_x_ucr",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Each registration year; the 2027 registration portal opened October 1, 2026"
   },
   "dueText": "The 2027 Registration Portal opens October 1, 2026. The site does not state the last day to register.",
   "weight": 40,
   "source": "us_x_src_ucr",
   "verified": false,
   "form": "UCR registration",
   "note": "Not confirmed: the deadline for the yearly registration, which the UCR site does not state, and FMCSA's own UCR page refused automated access. 2027 fees read on the site: $46 for 0-2 vehicles (and for brokers and leasing companies), $138 for 3-5, $276 for 6-20, $963 for 21-100, $4,592 for 101-1,000, $44,836 for 1,001 or more.",
   "roll": false
  },
  {
   "id": "us_x_tm_sec8",
   "name": "Trademark declaration of use (years 5 to 6)",
   "dept": "ip",
   "head": "Trademarks",
   "authority": "United States Patent and Trademark Office",
   "brief": "To keep a federal trademark registration, the owner must file a declaration that the mark is still in use.",
   "why": "You own a federally registered trademark.",
   "applies": {
    "q": "us_x_trademark",
    "yes": true
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Between the fifth and sixth years after the registration date"
   },
   "dueText": "Between the fifth and sixth years after the registration date. There is a six-month grace period after the deadline.",
   "weight": 50,
   "source": "us_x_src_tm",
   "verified": true,
   "form": "Section 8 declaration",
   "penalty": "If you don't file before the end of the grace period, your registration will be canceled or deemed expired.",
   "roll": false
  },
  {
   "id": "us_x_tm_renew",
   "name": "Trademark renewal (every 10 years)",
   "dept": "ip",
   "head": "Trademarks",
   "authority": "United States Patent and Trademark Office",
   "brief": "A federal trademark registration must be renewed, with a fresh declaration of use, every ten years.",
   "why": "You own a federally registered trademark.",
   "applies": {
    "q": "us_x_trademark",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "anniversary",
    "of": "us_x_tm_date",
    "every": 10
   },
   "dueText": "Between the ninth and 10th years after the registration date, and every 10 years after that. There is a six-month grace period after each deadline.",
   "weight": 45,
   "source": "us_x_src_tm",
   "verified": true,
   "form": "Combined Section 8 declaration and Section 9 renewal",
   "penalty": "If you don't file before the end of the grace period, your registration will be canceled or deemed expired.",
   "note": "Due once every ten years. The date shown is the 10th, 20th, 30th... anniversary of registration, the last day before the grace period.",
   "roll": false
  },
  {
   "id": "us_x_patent",
   "name": "Patent maintenance fees",
   "dept": "ip",
   "head": "Patents",
   "authority": "United States Patent and Trademark Office",
   "brief": "A patent stays in force only if maintenance fees are paid at three points after it is issued.",
   "why": "You own a US patent.",
   "applies": {
    "q": "us_x_patent",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "By 3.5, 7.5 and 11.5 years after the date of issue"
   },
   "dueText": "You may pay without surcharge at 3 to 3.5 years, 7 to 7.5 years, and 11 to 11.5 years after the date of issue, and with a surcharge during the six-month grace periods that follow each window. You cannot pay early.",
   "weight": 40,
   "source": "us_x_src_patent",
   "verified": true,
   "penalty": "If maintenance fees and any applicable surcharges are not paid the patent protection lapses.",
   "note": "Which kinds of patent carry maintenance fees was not read on the page.",
   "roll": false
  },
  {
   "id": "us_x_dmca",
   "name": "Renew the DMCA designated agent",
   "dept": "ip",
   "head": "Copyright",
   "authority": "U.S. Copyright Office",
   "brief": "A website or app that lets users post material keeps its copyright safe harbor only while it has a current designated agent on file with the Copyright Office. The designation lapses after three years.",
   "why": "You have designated a DMCA agent.",
   "applies": {
    "q": "us_x_dmca",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the designation expires, three years after it is registered"
   },
   "dueText": "A service provider's designation will expire and become invalid three years after it is registered with the Office, unless it is renewed by amending or resubmitting it. The fee is $6 per designation, amendment or resubmission.",
   "weight": 35,
   "source": "us_x_src_dmca",
   "verified": true,
   "penalty": "Service providers risk losing the safe harbor protections of section 512 of the DMCA.",
   "roll": false
  },
  {
   "id": "us_x_sam",
   "name": "Renew the SAM.gov registration",
   "dept": "contracts",
   "head": "Federal awards",
   "authority": "SAM.gov (U.S. General Services Administration)",
   "brief": "A business that wants federal contracts or grants as a prime awardee must hold an active registration in the System for Award Management and renew it every year.",
   "why": "You apply for federal awards as a prime awardee.",
   "applies": {
    "q": "us_x_fed_awards",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every 365 days after the registration or last renewal"
   },
   "dueText": "You must renew your registration every 365 days to keep it active.",
   "weight": 50,
   "source": "us_x_src_sam",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_vets4212",
   "name": "Federal contractor veterans' employment report",
   "dept": "contracts",
   "head": "Federal contractors",
   "authority": "Veterans' Employment and Training Service, U.S. Department of Labor",
   "brief": "Federal contractors and subcontractors above the contract threshold file the VETS-4212 report once a year.",
   "why": "You hold a federal contract or subcontract at or above the reporting threshold.",
   "applies": {
    "q": "us_x_fed_contract",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      9,
      30
     ]
    ]
   },
   "dueText": "The official filing cycle is yearly, August 1 to September 30.",
   "weight": 45,
   "source": "us_x_src_vets",
   "verified": true,
   "form": "VETS-4212",
   "penalty": "No fines, but federal contracting agencies are prohibited from obligating or expending funds to contract with a contractor that has not filed.",
   "note": "The page (updated August 6, 2026) calls $200,000 the current threshold, but one of its questions and answers still says $150,000.",
   "roll": false
  },
  {
   "id": "us_x_everify",
   "name": "E-Verify for federal contractors",
   "dept": "contracts",
   "head": "Federal contractors",
   "authority": "E-Verify (Department of Homeland Security)",
   "brief": "A contractor whose federal contract contains the FAR E-Verify clause must enroll in E-Verify and use it to confirm that new hires, and existing employees assigned to the contract, may work in the United States.",
   "why": "Your federal contract contains the FAR E-Verify clause.",
   "applies": {
    "all": [
     {
      "all": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "corporation",
         "llc",
         "nonprofit",
         "trust"
        ]
       },
       {
        "q": "us_employees",
        "yes": true
       }
      ]
     },
     {
      "q": "us_x_far_everify",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Enroll within 30 calendar days of the contract award date"
   },
   "dueText": "Enroll within 30 calendar days of the award date of a contract that contains the FAR E-Verify clause; begin using E-Verify for new hires within 90 calendar days of the enrollment date; after that, create a case no later than the third business day after the employee starts work for pay. Employees assigned to the contract: within 90 calendar days of enrollment or within 30 calendar days of the employee's assignment to the contract, whichever is later.",
   "weight": 45,
   "source": "us_x_src_everify",
   "verified": true,
   "form": "E-Verify",
   "note": "The page was last updated 05/18/2017. State E-Verify rules are not covered here.",
   "roll": false
  },
  {
   "id": "us_x_fda_food",
   "name": "Renew the FDA food facility registration",
   "dept": "sector",
   "head": "FDA registrations",
   "authority": "U.S. Food and Drug Administration",
   "brief": "Facilities that make, process, pack or hold food for people or animals in the United States register with FDA and must renew the registration every two years. There is no fee.",
   "why": "You own or run a food facility.",
   "applies": {
    "q": "us_x_food_facility",
    "yes": true
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      12,
      31
     ]
    ],
    "years": "even"
   },
   "dueText": "Every two years between October 1 and December 31. The current renewal period ends December 31, 2026.",
   "weight": 45,
   "source": "us_x_src_fda_food",
   "verified": true,
   "form": "Food Facility Registration",
   "penalty": "FDA will consider the registration to be expired for any facility that fails to renew by December 31, 2026.",
   "note": "Renewed every two years; 2026 is a renewal year, so the next ones fall in 2028 and 2030.",
   "roll": false
  },
  {
   "id": "us_x_ak_newhire",
   "name": "Report new hires to Alaska",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Alaska Child Support Services Division (Department of Revenue)",
   "brief": "Every employer that issues a W-2 reports each new or rehired employee, full or part time, to the state child support agency, through its online Business Portal. Independent contractors are not reported.",
   "why": "You hire employees who work in Alaska.",
   "applies": {
    "all": [
     {
      "state": [
       "AK"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of each hire or rehire"
   },
   "dueText": "New Hire Reports must be sent to CSED within 20 days of the date of hire or rehire.",
   "weight": 60,
   "source": "us_x_ak_newhire_src",
   "verified": true,
   "penalty": "$10 for each instance of failure to report per employee, and $100 per employee if the employer and employee conspire not to report.",
   "roll": false
  },
  {
   "id": "us_x_ak_uiwage",
   "name": "Alaska unemployment insurance contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Alaska Department of Labor and Workforce Development, Employment Security Tax",
   "brief": "Alaska employers file a quarterly contribution report with a wage schedule and pay unemployment insurance contributions (Alaska takes an employee share as well). A report is due every quarter while the account is open.",
   "why": "You pay employees in Alaska: anyone who hires one or more individuals to perform services is an employer for UI tax.",
   "applies": {
    "all": [
     {
      "state": [
       "AK"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "The report and wage schedule must be received by the last day of the month following the end of the calendar quarter. If you stop doing business, within 10 days after that date.",
   "weight": 80,
   "source": "us_x_ak_uiwage_src",
   "verified": true,
   "form": "Form TQ01",
   "penalty": "5% of the contributions due for each 30-day period or part of one that the report is late, up to 25%; minimum penalty $10. Penalties may be waived for reasonable cause.",
   "roll": false
  },
  {
   "id": "us_x_ak_unclaimed",
   "name": "Alaska unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Alaska Department of Revenue, Treasury Division (Unclaimed Property)",
   "brief": "Any business holding property that has gone unclaimed past its dormancy period (uncashed payroll cheques, refunds, deposits and the like) tries to reach the owner and then reports and remits it to the state. Reports are filed electronically; zero reports are not sent.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "AK"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Completed reports are due before November 1. Holders must make a diligent effort (written notice to the last known address) to locate owners of property of $100 or more.",
   "weight": 55,
   "source": "us_x_ak_unclaimed_src",
   "verified": true,
   "note": "Due 'before November 1', so the last day is October 31. The page gives no penalty and no due-diligence window in days. The state portal (unclaimedproperty.alaska.gov) says reports cover property unclaimed as of June 30, but it is a script-only page that could not be read.",
   "roll": false
  },
  {
   "id": "us_x_al_newhire",
   "name": "Report new hires to Alabama",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Alabama Department of Workforce",
   "brief": "Every employer reports each newly hired or recalled employee to the state New Hire Center. Employers with five or more employees must report online; smaller employers may report online or send copies of W-4s.",
   "why": "You hire employees who work in Alabama.",
   "applies": {
    "all": [
     {
      "state": [
       "AL"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 7 days of each hire or rehire"
   },
   "dueText": "Within seven days from the date of hire or reemployment.",
   "weight": 60,
   "source": "us_x_al_newhire_src",
   "verified": true,
   "penalty": "Employers who fail to report may be fined up to $25 per violation.",
   "note": "Online filers may instead send reports twice a month, not less than 12 nor more than 16 days apart (New-Hire Program FAQs, labor.alabama.gov/NewHire/FAQs).",
   "roll": false
  },
  {
   "id": "us_x_al_uiwage",
   "name": "Alabama unemployment compensation contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Alabama Department of Workforce",
   "brief": "Employers liable for Alabama unemployment compensation file a contribution and wage report every quarter and pay the tax. Reports are filed online through eGov.",
   "why": "You pay employees in Alabama: an employer becomes liable after 20 weeks of employment in a year or $1,500 of wages in a calendar quarter.",
   "applies": {
    "all": [
     {
      "state": [
       "AL"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Due the last day of the month following the end of the quarter (January 31, April 30, July 31 and October 31).",
   "weight": 80,
   "source": "us_x_al_uiwage_src",
   "verified": true,
   "penalty": "Late report: $25 or 10% of taxes owed, whichever is greater. Interest of 1% a month on contributions due until paid.",
   "roll": false
  },
  {
   "id": "us_x_al_unclaimed",
   "name": "Alabama unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Alabama State Treasurer, Unclaimed Property Division",
   "brief": "Every business must review its records each year for unclaimed property (uncashed cheques, wages, credits and the like), report it to the State Treasurer and remit it. Reports are filed electronically.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "AL"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Reports are due annually on or prior to November 1 of each year, for the period ending June 30. Notify owners in writing at least 60 days before filing (not required under $50 or with no known address).",
   "weight": 55,
   "source": "us_x_al_unclaimed_src",
   "verified": true,
   "penalty": "$100 for each business day up to $5,000 for failure to report, pay or deliver; $500 a day up to $25,000 if wilful; $1,000 a day up to $25,000 for a fraudulent report.",
   "note": "The Treasury's instructions are dated 10-25-16 (uploaded 2024). Extension requests must be in writing at least 15 days before November 1.",
   "roll": false
  },
  {
   "id": "us_x_al_breach",
   "name": "Notify people (and the Alabama Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Alabama Attorney General",
   "brief": "A business whose electronic records of sensitive personal information are breached must notify the affected people when the breach is reasonably likely to cause substantial harm. If more than 1,000 people must be notified, it also notifies the Attorney General and the national credit bureaus.",
   "why": "The business holds sensitive personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "AL"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 45 days of determining a breach occurred"
   },
   "dueText": "As expeditiously as possible and without unreasonable delay, and within 45 days of the determination that a breach has occurred and is reasonably likely to cause substantial harm. Attorney General: within the same 45 days when more than 1,000 individuals are notified.",
   "weight": 50,
   "source": "us_x_al_breach_src",
   "verified": true,
   "penalty": "An unlawful trade practice; knowing violations up to $500,000 per breach; up to $5,000 a day for each consecutive day of failing to take reasonable action to notify.",
   "note": "Read on a state agency's copy of the Act (acua.alabama.gov), which reproduces the Alabama Legislature's text; the legislature's own code site (ALISON) is a script-only app.",
   "roll": false
  },
  {
   "id": "us_x_ar_newhire",
   "name": "Report new hires to Arkansas",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Arkansas Division of Workforce Services (State New Hire Registry)",
   "brief": "All Arkansas employers, private, nonprofit and government, report every new employee who lives or works in Arkansas (anyone who fills out a W-4) through the Tax21 online system.",
   "why": "You hire employees who live or work in Arkansas.",
   "applies": {
    "all": [
     {
      "state": [
       "AR"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days of each hire"
   },
   "dueText": "All employers are required to report new employees within twenty (20) calendar days of hire, through the Tax21 online system.",
   "weight": 60,
   "source": "us_x_ar_newhire_src",
   "verified": true,
   "note": "No penalty is stated on either page.",
   "roll": false
  },
  {
   "id": "us_x_ar_uiwage",
   "name": "Arkansas quarterly unemployment wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Arkansas Division of Workforce Services",
   "brief": "Liable employers file a wage report every quarter, even when no wages were paid, and pay unemployment tax. Employers with 250 or more employees must file electronically through Tax21.",
   "why": "You pay employees in Arkansas: employing one or more workers for some part of ten or more days in a calendar year makes a business liable.",
   "applies": {
    "all": [
     {
      "state": [
       "AR"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Report due by April 30, July 31, October 31 and January 31 for the quarters ending March 31, June 30, September 30 and December 31.",
   "weight": 80,
   "source": "us_x_ar_uiwage_src",
   "verified": true,
   "form": "Form DWS-ARK-209B (or Tax21 online)",
   "penalty": "$10 or 5% of tax due (whichever is greater) if filed within 20 days after the due date; $20 or 10% if more than 20 days late; $30 or 15% if wages must be estimated or required information is missing.",
   "note": "The handbook is dated August 2022 (the most recent the agency publishes).",
   "roll": false
  },
  {
   "id": "us_x_ar_unclaimed",
   "name": "Arkansas unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Arkansas Auditor of State, Unclaimed Property Division",
   "brief": "Any business holding unclaimed property reports and remits it to the Auditor of State every year, after sending due-diligence letters to owners. Life insurance companies have an earlier date. A negative report is encouraged when there is nothing to report.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "AR"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "By November 1 (must be received by the last business day of October)"
   },
   "dueText": "Businesses and government agencies report and remit by November 1st every year; reports and remittances must be received by the last business day in October. Life insurance companies: by May 1st (received by the last business day in April). Owners must have at least 90 days to answer due-diligence letters before the report is filed.",
   "weight": 55,
   "source": "us_x_ar_unclaimed_src",
   "verified": true,
   "note": "Due diligence applies to property over $50 (the FAQ says $50 or more). Penalties are not stated; past-due property can go through the Voluntary Compliance Program without penalties and interest.",
   "roll": false
  },
  {
   "id": "us_x_ar_breach",
   "name": "Notify people (and the Arkansas Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Arkansas Attorney General",
   "brief": "A business whose computerised personal information is breached notifies affected Arkansans. If more than 1,000 people are affected, it also tells the Attorney General, and keeps its written breach determination for five years.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "AR"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Individuals: in a timely manner. Attorney General (over 1,000 people): when individuals are told or within 45 days, whichever is first"
   },
   "dueText": "Notify affected individuals in a timely manner. If more than 1,000 individuals are affected, disclose to the Attorney General at the same time the breach is disclosed to an affected individual or within forty-five (45) days after determining there is a reasonable likelihood of harm, whichever occurs first.",
   "weight": 50,
   "source": "us_x_ar_breach_src",
   "verified": true,
   "note": "The individual deadline wording ('in a timely manner') is the Attorney General's page; the statute's own wording for individuals was not read (arkleg code text not opened). No penalty is stated on either page.",
   "roll": false
  },
  {
   "id": "us_x_az_newhire",
   "name": "Report new hires to Arizona",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Arizona Department of Economic Security (Arizona New Hire Reporting Center)",
   "brief": "Every employer doing business in Arizona reports each hire or rehire of an employee who lives or works in Arizona, using a W-4 or an equivalent form, electronically, by mail or by fax.",
   "why": "You hire employees who live or work in Arizona.",
   "applies": {
    "all": [
     {
      "state": [
       "AZ"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of each hire, rehire or return to work"
   },
   "dueText": "Employers shall submit the reports within twenty days after the employee is hired or rehired or returns to work. Electronic filers send two monthly transmissions not more than sixteen days apart.",
   "weight": 60,
   "source": "us_x_az_newhire_src",
   "verified": true,
   "penalty": "None: the law does not allow the department to penalise employers for failing to report.",
   "note": "DES's own new-hire page (des.az.gov) refused automated access (HTTP 403); the statute was read instead.",
   "roll": false
  },
  {
   "id": "us_x_az_uiwage",
   "name": "Arizona unemployment tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Arizona Department of Economic Security, Unemployment Insurance Tax",
   "brief": "Employers liable for Arizona unemployment insurance file a quarterly tax and wage report and pay contributions.",
   "why": "You pay employees in Arizona.",
   "applies": {
    "all": [
     {
      "state": [
       "AZ"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Not read on an official page: DES's schedule page could not be opened. Reported as the last day of the month after each calendar quarter (April 30, July 31, October 31, January 31).",
   "weight": 80,
   "source": "us_x_az_uiwage_src",
   "verified": false,
   "form": "Form UC-018",
   "penalty": "Late report: one-tenth of one per cent of the total wages paid during the quarter, not less than $35 nor more than $200 (may be waived for good cause).",
   "note": "Every des.az.gov page (schedule, penalties, forms) and the Secretary of State's administrative code (R6-3-1704) returned HTTP 403. The due date must be confirmed with DES; only the penalty was read, on the statute.",
   "roll": false
  },
  {
   "id": "us_x_az_unclaimed",
   "name": "Arizona unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Arizona Department of Revenue, Unclaimed Property Unit",
   "brief": "Any business holding property presumed abandoned reports and remits it to the Department of Revenue every year, after sending a written notice to the owner. Life insurance companies have their own date.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "AZ"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Before November 1, covering the twelve months before July 1 of that year. Life insurance companies: before May 1, covering the prior calendar year. Send the owner a written notice at least 120 days before filing when the property is worth $50 or more.",
   "weight": 55,
   "source": "us_x_az_unclaimed_src",
   "verified": true,
   "note": "Life insurance companies: before May 1 (shown as the general date here). Extension requests go in before April 1 or October 1. The penalty section of the statute was not found and is left out.",
   "roll": false
  },
  {
   "id": "us_x_az_breach",
   "name": "Notify people (and the Arizona Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Arizona Attorney General",
   "brief": "A business that owns or licenses computerised personal information and finds a breach notifies the affected people. If more than 1,000 people are affected it also notifies the three largest credit bureaus, the Attorney General and the Arizona Department of Homeland Security.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "AZ"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 45 days of determining a breach occurred"
   },
   "dueText": "Within forty-five days after the determination of the breach; the same 45 days for the Attorney General and credit bureaus when more than one thousand individuals are involved.",
   "weight": 50,
   "source": "us_x_az_breach_src",
   "verified": true,
   "penalty": "Civil penalty up to the lesser of $10,000 per affected individual or the total amount of economic loss, and no more than $500,000 for a breach or series of related breaches.",
   "roll": false
  },
  {
   "id": "us_x_ca_newhire",
   "name": "Report new hires to California",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "California Employment Development Department",
   "brief": "Every California employer, whatever its size, reports each new or rehired employee who works in California on a Report of New Employee(s) (DE 34), online through e-Services for Business, by mail or by fax.",
   "why": "You hire employees who work in California.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of each employee's start-of-work date"
   },
   "dueText": "Report all new or rehired employees within 20 calendar days of their start-of-work date (the first day the employee performed services for pay).",
   "weight": 60,
   "source": "us_x_ca_newhire_src",
   "verified": true,
   "form": "DE 34",
   "penalty": "$24 for each unreported employee; $490 if the failure results from an agreement with the employee not to report or to file a false or incomplete report.",
   "roll": false
  },
  {
   "id": "us_x_ca_uiwage",
   "name": "California quarterly contribution return and report of wages",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "California Employment Development Department",
   "brief": "Every quarter California employers file the Quarterly Contribution Return and Report of Wages (DE 9) and the per-employee wage detail (DE 9C), covering unemployment insurance, employment training tax, state disability insurance and California income tax withheld. Both are filed even in a quarter with no wages.",
   "why": "You are registered with the EDD as an employer in California.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Due the first day of the month after the quarter; delinquent if not filed by the last day of that month (for 2026: April 30, July 31, November 2 and, for the fourth quarter, February 1, 2027).",
   "weight": 80,
   "source": "us_x_ca_uiwage_src",
   "verified": true,
   "form": "DE 9 and DE 9C",
   "penalty": "Late reports are subject to penalty and interest. If a DE 9C is not filed within 15 days of a written demand, $20 for each unreported employee plus interest.",
   "note": "The calendar gives a due date (the 1st of the month after the quarter) and a delinquency date; the date shown is the delinquency date. When it falls on a weekend or holiday the next business day is timely.",
   "roll": false
  },
  {
   "id": "us_x_ca_unclaimed",
   "name": "California unclaimed property Notice Report and Remit Report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "California State Controller's Office, Unclaimed Property Division",
   "brief": "Businesses holding unclaimed property first file a Notice Report listing it, then send the property with a Remit Report after the Controller has notified owners. Owners must be notified by the holder by mail beforehand.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Not read on an official page (the Controller's site and the Legislature's code site refused automated access). Reported as: Notice Report before November 1 (life insurers before May 1); Remit Report June 1-15 (life insurers December 1-15).",
   "weight": 55,
   "source": "us_x_ca_unclaimed_src",
   "verified": false,
   "note": "Confirm both dates and the 6-to-12-month owner notice window with the State Controller before relying on them.",
   "roll": false
  },
  {
   "id": "us_x_ca_breach",
   "name": "Notify California residents (and the Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "California Attorney General",
   "brief": "A business must notify any California resident whose unencrypted personal information was, or is reasonably believed to have been, acquired by an unauthorized person. If more than 500 California residents are notified from one breach, it also submits one sample copy of the notice to the Attorney General electronically.",
   "why": "The business holds personal information about California residents.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "After discovering a breach: confirm the deadline in Civil Code 1798.82"
   },
   "dueText": "The Attorney General's page states the duty (Civil Code 1798.82(a)) and the sample-notice duty for breaches affecting more than 500 California residents (1798.82(f)) but gives no deadline in days.",
   "weight": 50,
   "source": "us_x_ca_breach_src",
   "verified": false,
   "note": "An amendment effective January 1, 2026 (SB 446) is reported to set 30 calendar days for residents and 15 calendar days after that for the Attorney General sample, but the statute text could not be opened (leginfo.legislature.ca.gov returned HTTP 403). Confirm before relying on a day count.",
   "roll": false
  },
  {
   "id": "us_x_ca_paydata",
   "name": "California pay data report",
   "dept": "labour",
   "head": "Pay reporting",
   "authority": "California Civil Rights Department",
   "brief": "Private employers with 100 or more payroll employees, and private employers using 100 or more workers hired through labour contractors, file a yearly report of pay and hours by job category, sex, race and ethnicity.",
   "why": "You have 100 or more employees (or 100 or more labour contractor workers) and employees in California.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     },
     {
      "q": "us_x_emp100",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Each May on the date the Civil Rights Department sets (May 13, 2026 for reporting year 2025)"
   },
   "dueText": "Pay data reports for Reporting Year 2025 are due May 13, 2026.",
   "weight": 40,
   "source": "us_x_ca_paydata_src",
   "verified": true,
   "note": "The page gives the date year by year; it states no penalty.",
   "roll": false
  },
  {
   "id": "us_x_ca_retire",
   "name": "Register for CalSavers or certify an exemption",
   "dept": "labour",
   "head": "State retirement programme",
   "authority": "CalSavers Retirement Savings Program (California State Treasurer)",
   "brief": "California employers with one or more California employees that do not offer a qualified retirement plan must register with CalSavers and enrol their employees in the state's payroll savings programme. Employers that do offer a plan file an exemption.",
   "why": "You have employees in California and no workplace retirement plan.",
   "applies": {
    "all": [
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     },
     {
      "q": "us_x_retirement_plan",
      "no": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "New business: 90 days after reaching one employee; otherwise by December 31 when mandated"
   },
   "dueText": "A new business's CalSavers compliance deadline begins 90 days after it reaches the one-employee threshold. Employers reporting one or more employees on the prior year's four DE 9C filings have a registration deadline of December 31.",
   "weight": 50,
   "source": "us_x_ca_retire_src",
   "verified": true,
   "penalty": "After a notice of noncompliance: $250 per eligible employee if still noncompliant 90 days after the notice, and an additional $500 per eligible employee after 180 days.",
   "note": "Employers that already sponsor a qualified plan must still file an exemption form; that is not modelled here.",
   "roll": false
  },
  {
   "id": "us_x_co_newhire",
   "name": "Report new hires to Colorado",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Colorado State Directory of New Hires (Colorado Department of Human Services, Child Support Services)",
   "brief": "Public and private employers report every newly hired or rehired employee working in Colorado, and also independent contractors paid $600 or more and rideshare or delivery drivers using a network company's platform. Electronic reporting is preferred.",
   "why": "You hire employees, or use service providers, who work in Colorado.",
   "applies": {
    "all": [
     {
      "state": [
       "CO"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire date (the date services are first performed for pay)"
   },
   "dueText": "Reports must be submitted within 20 days of hire date (i.e., the date services are first performed for pay).",
   "weight": 60,
   "source": "us_x_co_newhire_src",
   "verified": true,
   "note": "The form also names service providers (independent contractors paid $600 or more). No penalty is stated.",
   "roll": false
  },
  {
   "id": "us_x_co_uiwage",
   "name": "Colorado unemployment insurance wage report and premiums",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Colorado Department of Labor and Employment, Unemployment Insurance",
   "brief": "Colorado employers file a wage report and pay unemployment insurance premiums every quarter, online in MyUI Employer+.",
   "why": "You pay employees in Colorado.",
   "applies": {
    "all": [
     {
      "state": [
       "CO"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Not read on an official page (cdle.colorado.gov refused automated access). Reported as the last day of the month after each quarter: April 30, July 31, October 31, January 31.",
   "weight": 80,
   "source": "us_x_co_uiwage_src",
   "verified": false,
   "note": "Confirm the due date and the late-report penalty with CDLE before relying on them.",
   "roll": false
  },
  {
   "id": "us_x_co_unclaimed",
   "name": "Colorado unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Colorado Department of the Treasury, Unclaimed Property Division (Great Colorado Payback)",
   "brief": "Businesses holding unclaimed property report and remit it to the State Treasurer every year after a written notice to owners.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "CO"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Not read on an official page (the holder pages are script-only and treasury.colorado.gov refused automated access). Reported as: November 1 for the period ending June 30; insurance companies May 1.",
   "weight": 55,
   "source": "us_x_co_unclaimed_src",
   "verified": false,
   "note": "Confirm the date, the owner-notice window and whether a negative report is required with the Colorado Treasury.",
   "roll": false
  },
  {
   "id": "us_x_co_breach",
   "name": "Notify Colorado residents (and the Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Colorado Attorney General",
   "brief": "A business that holds computerised personal information about Colorado residents investigates a suspected breach promptly and notifies affected residents. If 500 or more Colorado residents are affected it also notifies the Attorney General; over 1,000, the national credit bureaus too.",
   "why": "The business holds personal information about Colorado residents.",
   "applies": {
    "all": [
     {
      "state": [
       "CO"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after determining a security breach occurred"
   },
   "dueText": "In the most expedient time possible and without unreasonable delay, but not later than thirty days after the date of determination that a security breach occurred. The same 30 days apply to notice to the Attorney General when 500 or more Colorado residents are reasonably believed affected.",
   "weight": 50,
   "source": "us_x_co_breach_src",
   "verified": true,
   "note": "Read in the 2018 session law that set the 30-day rule; later amendments were not checked (the Attorney General's FAQ page returned no text).",
   "roll": false
  },
  {
   "id": "us_x_ct_newhire",
   "name": "Report new hires to Connecticut",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Connecticut Department of Labor",
   "brief": "Employers doing business in Connecticut report every hire, and every rehire after a break of 60 days or more, to the Department of Labor, online, by secure file transfer, fax or mail.",
   "why": "You hire employees in Connecticut.",
   "applies": {
    "all": [
     {
      "state": [
       "CT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days of hire if reported electronically; within 20 days by fax or mail"
   },
   "dueText": "Report all hires to CTDOL within 14 days of the date of hire, or within 20 days if reporting via fax or postal mail.",
   "weight": 60,
   "source": "us_x_ct_newhire_src",
   "verified": true,
   "note": "The business.ct.gov article says 'within 20 days of hiring' and 14 days for FTP reporting; the Department of Labor guide (2026) gives 14 days for all electronic reporting. No penalty is stated.",
   "roll": false
  },
  {
   "id": "us_x_ct_uiwage",
   "name": "Connecticut unemployment tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Connecticut Department of Labor, Unemployment Insurance Tax Division",
   "brief": "Liable employers file a tax and wage report and pay unemployment contributions every quarter through ReEmployCT. A 'no wage' return is still due in a quarter without wages.",
   "why": "You pay employees in Connecticut: $1,500 of wages in a calendar quarter, or one employee in 20 different weeks, makes an employer liable.",
   "applies": {
    "all": [
     {
      "state": [
       "CT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "1st quarter returns and payments due on or before 4/30; 2nd quarter 7/31; 3rd quarter 10/31; 4th quarter 1/31. Reimbursing employers: 15 days later. A due date on a weekend or holiday moves to the next business day.",
   "weight": 80,
   "source": "us_x_ct_uiwage_src",
   "verified": true,
   "penalty": "Late file fee of $25. Contributions not paid within 30 days of the due date: penalty of $50 or 10% of contributions due, whichever is greater, plus monthly interest.",
   "roll": false
  },
  {
   "id": "us_x_ct_unclaimed",
   "name": "Connecticut unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Connecticut Office of the State Treasurer, Unclaimed Property Division",
   "brief": "All businesses report and remit property presumed abandoned as of December 31 to the State Treasurer each spring, after sending due-diligence letters to owners in the autumn. Reports are filed online.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "CT"
      ]
     },
     {
      "q": "us_x_unclaimed",
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
      31
     ]
    ]
   },
   "dueText": "Report abandoned property to the State Treasurer's Office each year by March 31 (within 90 days after the December 31 presumption-of-abandonment date). Owners' deadline to answer due-diligence letters must fall before December 31.",
   "weight": 55,
   "source": "us_x_ct_unclaimed_src",
   "verified": true,
   "note": "Unusual: Connecticut's report is due in the spring, not November. The Treasurer's pages that could be read are older (brochure from an earlier Treasurer; instructions for the 2019 year, which said 'no later than March 30, 2020'). The statute (cga.ct.gov) returned HTTP 503 and the Holder Alerts page is gone, so the current year's exact date and the penalty were not confirmed.",
   "roll": false
  },
  {
   "id": "us_x_ct_breach",
   "name": "Notify Connecticut residents and the Attorney General of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Connecticut Attorney General",
   "brief": "Any person or company that owns, licenses or maintains computerised personal information notifies affected Connecticut residents of a breach, and tells the Attorney General no later than the residents. If Social Security or taxpayer ID numbers may be exposed, 24 months of credit monitoring must be offered.",
   "why": "The business holds personal information about Connecticut residents.",
   "applies": {
    "all": [
     {
      "state": [
       "CT"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 days of discovering the breach; the Attorney General no later than residents"
   },
   "dueText": "Without unreasonable delay and no later than sixty (60) days from discovery of the breach. Notice to the Attorney General no later than when residents are notified.",
   "weight": 50,
   "source": "us_x_ct_breach_src",
   "verified": true,
   "penalty": "Failing to meet the notice requirements is a violation of the Connecticut Unfair Trade Practices Act.",
   "roll": false
  },
  {
   "id": "us_x_ct_pfml",
   "name": "Connecticut Paid Leave contributions and wage report",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Connecticut Paid Leave Authority",
   "brief": "Employers withhold the employee contribution for Connecticut Paid Leave and send it, with a report of each employee's wages, to the CT Paid Leave Authority every quarter.",
   "why": "You pay employees in Connecticut.",
   "applies": {
    "all": [
     {
      "state": [
       "CT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Contributions are due on the last day of the month of each quarter (March 31, June 30, September 30, December 31). No penalties or interest are imposed if payment is submitted by the last day of the month following the calendar quarter.",
   "weight": 70,
   "source": "us_x_ct_pfml_src",
   "verified": true,
   "penalty": "Unpaid contributions accrue 1% non-compounding interest a month; a single penalty of up to 10% of the amount owed or $50, whichever is greater.",
   "note": "The date shown is the last penalty-free day (the end of the month after the quarter).",
   "roll": false
  },
  {
   "id": "us_x_dc_newhire",
   "name": "Report new hires to the District of Columbia",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Office of the Attorney General for the District of Columbia, Child Support Services Division (DC Directory of New Hires)",
   "brief": "Employers report every newly hired, rehired (after 60 days or more away) and recalled employee, full time, part time or temporary, to the DC Directory of New Hires.",
   "why": "You hire employees who work in the District of Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "DC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of each hire, rehire or recall"
   },
   "dueText": "Within 20 days of their hire, rehire, or recall date. Electronic filers may send two monthly transmissions not less than 12 nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_dc_newhire_src",
   "verified": true,
   "penalty": "Civil penalty of $25 for each employee not reported ($500 if the employer and employee conspired not to report or to file a false report), accruing monthly until the employer complies.",
   "roll": false
  },
  {
   "id": "us_x_dc_uiwage",
   "name": "DC employer's quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "DC Department of Employment Services, Office of Unemployment Compensation Tax",
   "brief": "Employers file the Employer's Quarterly Contribution and Wage Report (UC-30) every quarter and pay unemployment tax; a zero-wage report is still filed in a quarter with no wages.",
   "why": "You pay employees in the District of Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "DC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly reports are due on April 30, July 31, October 31 and January 31.",
   "weight": 80,
   "source": "us_x_dc_uiwage_src",
   "verified": true,
   "form": "Form UC-30",
   "penalty": "Late reports or taxes: 10 percent of the tax due, but not less than $100, plus interest of 1.5 percent of the tax due per month or part of a month until paid.",
   "roll": false
  },
  {
   "id": "us_x_dc_unclaimed",
   "name": "DC unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "DC Office of the Chief Financial Officer, Unclaimed Property Unit",
   "brief": "Businesses and financial institutions report and remit abandoned property to the District each year, after mailing owners a notice. Life insurance companies have a spring date.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "DC"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Prior to November 1 of each year, for items considered abandoned as of June 30 of the same year. Life insurance companies: prior to May 1, for items abandoned as of December 31 of the preceding year. Notify owners by first class mail no less than 60 and no more than 120 days before reporting.",
   "weight": 55,
   "source": "us_x_dc_unclaimed_src",
   "verified": true,
   "note": "Due 'prior to November 1', so the last day is October 31. Extensions must be requested in writing before the due date. No penalty is stated.",
   "roll": false
  },
  {
   "id": "us_x_dc_breach",
   "name": "Notify DC residents (and the Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Office of the Attorney General for the District of Columbia",
   "brief": "A business holding computerised personal information about DC residents promptly notifies those affected by a breach. If 50 or more residents are affected it also notifies the Attorney General in writing; over 1,000 people, the credit bureaus too.",
   "why": "The business holds personal information about District residents.",
   "applies": {
    "all": [
     {
      "state": [
       "DC"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay"
   },
   "dueText": "In the most expedient time possible and without unreasonable delay. Attorney General (50 or more District residents): in no event later than when notice is provided to residents.",
   "weight": 50,
   "source": "us_x_dc_breach_src",
   "verified": true,
   "note": "No fixed day count in the law.",
   "roll": false
  },
  {
   "id": "us_x_dc_pfml",
   "name": "DC Paid Family Leave contributions and wage report",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "DC Department of Employment Services, Office of Paid Family Leave",
   "brief": "Private employers pay a quarterly payroll contribution on the wages of employees working in the District to fund DC Paid Family Leave, and report those wages each quarter.",
   "why": "You pay employees who work in the District of Columbia.",
   "applies": {
    "all": [
     {
      "state": [
       "DC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Not later than the last day of the month following the close of each calendar quarter, make a report of and pay the contributions accrued on wages paid to covered employees during the quarter.",
   "weight": 70,
   "source": "us_x_dc_pfml_src",
   "verified": true,
   "penalty": "Interest of 1.5% a month on unpaid contributions; a flat penalty of 10% of the amount due, not less than $100, if contributions are not paid or reports not filed on time (may be waived for good cause).",
   "note": "The rule read dates from 2018 and states a 0.62% rate that has since changed; the current rate is not given here. DOES says an employer paying DC unemployment insurance for an employee is presumed to owe the contribution.",
   "roll": false
  },
  {
   "id": "us_x_de_newhire",
   "name": "Report new hires to Delaware",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Delaware Division of Child Support Services (State Directory of New Hires)",
   "brief": "Employers report every newly hired employee to the Delaware State Directory of New Hires through the New Hire Reporting website.",
   "why": "You hire employees in Delaware.",
   "applies": {
    "all": [
     {
      "state": [
       "DE"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of each employee's start date"
   },
   "dueText": "Employers must report all newly hired employees to the Delaware State Directory of New Hires within 20 days of their start date.",
   "weight": 60,
   "source": "us_x_de_newhire_src",
   "verified": true,
   "note": "No penalty is stated. The reporting website (newhire.dhss.delaware.gov) could not be reached from this session.",
   "roll": false
  },
  {
   "id": "us_x_de_uiwage",
   "name": "Delaware quarterly unemployment wage and tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Delaware Department of Labor, Division of Unemployment Insurance",
   "brief": "Delaware employers file a wage and tax return every quarter and pay unemployment insurance tax with it.",
   "why": "You pay employees in Delaware.",
   "applies": {
    "all": [
     {
      "state": [
       "DE"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Returns are due by the end of the month following the end of the quarter, with payment due with the return.",
   "weight": 80,
   "source": "us_x_de_uiwage_src",
   "verified": true,
   "form": "Form UC-8",
   "penalty": "A penalty assessment of $17.50 for each late report; interest of 1.5% a month on late payments.",
   "note": "The Department's older UI Employer Handbook gives the late-report fine as $17.25 when filed more than five days late; the FAQ figure ($17.50) is used here.",
   "roll": false
  },
  {
   "id": "us_x_de_unclaimed",
   "name": "Delaware unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Delaware Department of Finance, Office of Unclaimed Property (State Escheator)",
   "brief": "Every business holding unclaimed property reports it to the State Escheator each year after mailing the owner a notice 60 to 120 days before filing. Banks and insurance companies have their own dates.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "DE"
      ]
     },
     {
      "q": "us_x_unclaimed",
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
    ]
   },
   "dueText": "On or before March 1 of each year, covering the 12 months preceding January 1. Banking organizations: on or before November 10. Insurance companies: on or before December 20. Owner notice: not more than 120 days nor less than 60 days before filing (property of $50 or more, or any security).",
   "weight": 55,
   "source": "us_x_de_unclaimed_src",
   "verified": true,
   "penalty": "Interest of 0.5% a month (up to 50%). Failure to file: the lesser of 5% a month (up to 50%) or $100 a day (up to $5,000). Failure to pay or deliver: 0.5% a month up to 25%. Evasion or wilful failure: $1,000 a day up to $25,000 plus 25% of the property.",
   "roll": false
  },
  {
   "id": "us_x_de_breach",
   "name": "Notify Delaware residents (and the Attorney General) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Delaware Attorney General",
   "brief": "A business holding computerised personal information about Delaware residents notifies them of a breach. If more than 500 residents are notified it also tells the Attorney General, and where Social Security numbers were involved it offers one year of free credit monitoring.",
   "why": "The business holds personal information about Delaware residents.",
   "applies": {
    "all": [
     {
      "state": [
       "DE"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 days after determining the breach; the Attorney General no later than residents"
   },
   "dueText": "Without unreasonable delay but not later than 60 days after determination of the breach of security. If more than 500 residents are notified, notice to the Attorney General not later than the time when notice is provided to the resident.",
   "weight": 50,
   "source": "us_x_de_breach_src",
   "verified": true,
   "penalty": "The Attorney General may bring an action to address violations and recover direct economic damages; no fine amount is set.",
   "roll": false
  },
  {
   "id": "us_x_de_pfml",
   "name": "Delaware Paid Leave contributions and Hours & Wage report",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Delaware Department of Labor, Division of Paid Leave",
   "brief": "Employers with 10 or more eligible employees in Delaware pay Delaware Paid Leave contributions and file a quarterly Hours & Wage report through Delaware LaborFirst. Employers with a private plan file the report too. Employers with fewer than 10 eligible employees need not take part.",
   "why": "You employ people working in Delaware; the duty applies once you have 10 or more eligible employees.",
   "applies": {
    "all": [
     {
      "state": [
       "DE"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "days": 30
   },
   "dueText": "Contributions are due 30 days after the end of each calendar quarter; Hours & Wage reports are due on the 30th day after each calendar quarter ends. A 6-day grace period is normally granted.",
   "weight": 70,
   "source": "us_x_de_pfml_src",
   "verified": true,
   "penalty": "After the grace period, interest of 1.5% and penalties may apply.",
   "note": "The 10-eligible-employee threshold is not asked by the shared questions; show it as 'confirm'. Private-plan employers' first report was due April 30, 2026.",
   "roll": false
  },
  {
   "id": "us_x_fl_newhire",
   "name": "Report new hires (and independent contractors) to Florida",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Florida Department of Revenue, Child Support Program (Florida New Hire Reporting Center)",
   "brief": "All employers report newly hired and rehired employees. Businesses must also report independent contractors they pay $600 or more in a calendar year. Reports go online, electronically, by mail or by fax.",
   "why": "You hire employees, or pay independent contractors, who work in Florida.",
   "applies": {
    "all": [
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire date; contractors within 20 days of the first payment or the signed contract, whichever is earlier"
   },
   "dueText": "Within 20 days of the hire date of the employee. Independent contractors: within 20 days after the earlier of the first payment that requires an IRS information return or the date the contract is signed.",
   "weight": 60,
   "source": "us_x_fl_newhire_src",
   "verified": true,
   "form": "CS-EF315 (or online)",
   "note": "Florida is one of the states that also requires independent contractors ($600 or more a year) to be reported. No employer penalty is stated.",
   "roll": false
  },
  {
   "id": "us_x_fl_unclaimed",
   "name": "Florida unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Florida Department of Financial Services, Division of Unclaimed Property",
   "brief": "Every holder of abandoned property reports it electronically to the Department of Financial Services each spring for the preceding calendar year, after sending owners of property worth $50 or more a written notice.",
   "why": "The business holds money or property owed to someone who has not claimed it.",
   "applies": {
    "all": [
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      4,
      30
     ]
    ]
   },
   "dueText": "The report must be filed before May 1 of each year, covering the preceding calendar year. Send the owner written notice at least 90 days, but not more than 180 days, before filing (property of $50 or more).",
   "weight": 55,
   "source": "us_x_fl_unclaimed_src",
   "verified": true,
   "penalty": "Interest of 12 percent a year on property not reported, paid or delivered on time. Wilful failure to report: $500 a day up to $5,000, plus 25 percent of the value of property not reported.",
   "note": "Unusual: Florida's report is due in the spring (before May 1), not November. Older Division manuals give a 60-to-120-day notice window; the current statute says 90 to 180 days.",
   "roll": false
  },
  {
   "id": "us_x_fl_breach",
   "name": "Notify Florida residents (and the Department of Legal Affairs) of a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Florida Department of Legal Affairs (Attorney General)",
   "brief": "A business holding personal information notifies each affected Florida individual of a breach. If 500 or more people in Florida are affected it also notifies the Department of Legal Affairs; over 1,000, the credit bureaus too.",
   "why": "The business holds personal information about people in Florida.",
   "applies": {
    "all": [
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after determining a breach (15 more days possible with good cause given in writing)"
   },
   "dueText": "Notice to individuals no later than 30 days after the determination of a breach or reason to believe a breach occurred. Notice to the department (500 or more individuals) as expeditiously as practicable, but no later than 30 days. 15 additional days may be granted for good cause given in writing within the 30 days.",
   "weight": 50,
   "source": "us_x_fl_breach_src",
   "verified": true,
   "penalty": "Civil penalty of $1,000 a day for the first 30 days, then $50,000 for each further 30-day period up to 180 days, and up to $500,000 beyond 180 days.",
   "roll": false
  },
  {
   "id": "us_x_ga_breach",
   "name": "Tell Georgia residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Georgia Attorney General, Consumer Protection Division",
   "brief": "A business that collects, transmits or keeps unencrypted digital records of personal information must tell each affected person when it knows or reasonably believes its system has been breached.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "GA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after the breach is discovered (no fixed number of days)"
   },
   "dueText": "In the most expedient time possible and without unreasonable delay, unless a law enforcement agency determines that notification will compromise a criminal investigation.",
   "weight": 50,
   "source": "us_x_ga_breach_src",
   "verified": true,
   "note": "Read on the Attorney General's consumer page, which summarises O.C.G.A. § 10-1-912; the statute text itself is not on a Georgia government site that could be read. Georgia sets no fixed number of days and the page names no notice to a regulator.",
   "roll": false
  },
  {
   "id": "us_x_ga_newhire",
   "name": "Report new hires to Georgia",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Georgia Department of Human Services (Georgia State Directory of New Hires)",
   "brief": "Every employer reports each newly hired or rehired employee to the Georgia State Directory of New Hires, online, by file upload or on paper.",
   "why": "You have employees in Georgia.",
   "applies": {
    "all": [
     {
      "state": [
       "GA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days of each employee's hire date"
   },
   "dueText": "Employers are required to submit a report within 10 days of a new employee's hire date. Employers who submit reports electronically are to submit the reports in two monthly transmissions not more than 16 days apart.",
   "weight": 60,
   "source": "us_x_ga_newhire_src",
   "verified": true,
   "form": "Georgia New Hire Reporting Form, W-4 or electronic file",
   "note": "Georgia's deadline is shorter than the federal 20 days. The directory's compliance page only describes the penalty federal law lets states impose (up to $25 per employee, $500 for a conspiracy); it does not state a Georgia penalty, so none is recorded. The official site ga-newhire.com is run on newhire-reporting.com.",
   "roll": false
  },
  {
   "id": "us_x_ga_uiwage",
   "name": "Georgia quarterly unemployment tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Georgia Department of Labor",
   "brief": "Employers liable for Georgia unemployment insurance file a tax and wage report every quarter and pay the tax due with it.",
   "why": "You have employees in Georgia.",
   "applies": {
    "all": [
     {
      "state": [
       "GA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "The Employer's Quarterly Tax and Wage Report and total payment of tax due must be submitted within a month after the quarter ending date (April 30, July 31, October 31 and January 31). If the due date falls on a weekend or legal holiday, reports are due the next business day.",
   "weight": 80,
   "source": "us_x_ga_uiwage_src",
   "verified": true,
   "form": "DOL-4N, Employer's Quarterly Tax and Wage Report",
   "penalty": "Late filing: the greater of .05% of total wages for the tax period or $20 per month or fraction of a month the report is delinquent. Interest on unpaid tax: 1½% per month or fraction of a month.",
   "note": "Read on a Georgia DOL leaflet dated 2/17/2022 that is still the download on dol.georgia.gov.",
   "roll": false
  },
  {
   "id": "us_x_ga_unclaimed",
   "name": "Georgia unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Georgia Department of Revenue, Unclaimed Property Program",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Georgia each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "GA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Holder reports are due on November 1st for all holders except insurance companies. Insurance companies must report by May 1st. Holders with nothing to report file a negative report.",
   "weight": 55,
   "source": "us_x_ga_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "note": "Insurance companies: May 1. A negative report is required. Due diligence means a first-class letter to the owner's last known address; the FAQ gives no window in days and no penalty.",
   "roll": false
  },
  {
   "id": "us_x_hi_breach",
   "name": "Tell Hawaii residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Hawaii Office of Consumer Protection (Department of Commerce and Consumer Affairs)",
   "brief": "A business that owns or licenses personal information of Hawaii residents notifies affected people after a security breach. If more than 1,000 people are notified at one time, it also notifies the Office of Consumer Protection and the nationwide consumer reporting agencies in writing.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "HI"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovering the breach (no fixed number of days)"
   },
   "dueText": "Notification shall be made without unreasonable delay. Where more than 1,000 persons are notified at one time, notify in writing, without unreasonable delay, the State of Hawaii's office of consumer protection and all consumer reporting agencies.",
   "weight": 50,
   "source": "us_x_hi_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_hi_newhire",
   "name": "Report new hires to Hawaii",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Hawaii Child Support Enforcement Agency (Department of the Attorney General)",
   "brief": "Every employer in Hawaii reports each new hire, and each rehire after at least 60 days away, to the Child Support Enforcement Agency.",
   "why": "You have employees in Hawaii.",
   "applies": {
    "all": [
     {
      "state": [
       "HI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hire"
   },
   "dueText": "Every employer in the State shall report to the agency within twenty days of hire. Employers reporting electronically send reports twice a month, not less than twelve nor more than sixteen days apart.",
   "weight": 60,
   "source": "us_x_hi_newhire_src",
   "verified": true,
   "form": "W-4, HW-4 or equivalent form",
   "penalty": "A civil penalty of $25 for each failure to report, or $500 if the failure is the result of a conspiracy between the employer and the employee to not supply the required report or to supply a false or incomplete report.",
   "roll": false
  },
  {
   "id": "us_x_hi_uiwage",
   "name": "Hawaii quarterly wage, contribution and assessment report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Hawaii Department of Labor and Industrial Relations, Unemployment Insurance Division",
   "brief": "Every subject employer files Form UC-B6 online each quarter, even when no wages were paid, and pays the unemployment contributions due.",
   "why": "You have employees in Hawaii.",
   "applies": {
    "all": [
     {
      "state": [
       "HI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "On or before the last day of the month following the close of the calendar quarter: April 30, July 31, October 31 and January 31. Form UC-B6 must be filed each quarter even though wages were not paid.",
   "weight": 80,
   "source": "us_x_hi_uiwage_src",
   "verified": true,
   "form": "UC-B6",
   "penalty": "Late report: $30. Late contribution payment: 10% but not less than $100, plus interest of two-thirds of one percent a month. An employer with a missing report when rated is assessed the maximum rate.",
   "roll": false
  },
  {
   "id": "us_x_hi_unclaimed",
   "name": "Hawaii unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Hawaii Department of Budget and Finance, Unclaimed Property Program",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Hawaii each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "HI"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "The holder report and remittance are due by November 1. The cycle begins May 1, six months before the deadline, when holders send written notice to apparent owners. A notarized cover sheet and Affidavit of Due Diligence goes with the report.",
   "weight": 55,
   "source": "us_x_hi_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "note": "The guidelines read here state no penalty. Due-diligence letters: from May 1.",
   "roll": false
  },
  {
   "id": "us_x_ia_breach",
   "name": "Tell Iowa residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Iowa Attorney General, Consumer Protection Division",
   "brief": "A person who owns or licenses computerized personal information of Iowa consumers notifies affected consumers of a breach. If more than 500 Iowa residents are notified, it also notifies the Attorney General's consumer protection division in writing.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "IA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Consumers: without unreasonable delay. Attorney General (over 500 residents): within 5 business days after notifying consumers"
   },
   "dueText": "Consumer notice in the most expeditious manner possible and without unreasonable delay. Notice to the director of the consumer protection division of the office of the attorney general within five business days after giving notice to any consumer (breaches requiring notice to more than 500 residents).",
   "weight": 50,
   "source": "us_x_ia_breach_src",
   "verified": true,
   "penalty": "A violation is an unlawful practice under Iowa Code 714.16; the Attorney General may also obtain damages for injured persons.",
   "roll": false
  },
  {
   "id": "us_x_ia_newhire",
   "name": "Report new hires to Iowa",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Iowa Centralized Employee Registry (Child Support Services)",
   "brief": "Iowa employers report each hire and rehire to the Centralized Employee Registry, including whether dependent health cover is available.",
   "why": "You have employees in Iowa.",
   "applies": {
    "all": [
     {
      "state": [
       "IA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of hiring or rehiring the employee"
   },
   "dueText": "Within fifteen days of the hiring or rehiring of the employee. Employers transmitting electronically may report through transmissions not less than twelve nor more than sixteen days apart.",
   "weight": 60,
   "source": "us_x_ia_newhire_src",
   "verified": true,
   "form": "Iowa W-4 (IA W-4), federal W-4 or electronic report",
   "penalty": "Any state agency using the registry, or the attorney general, may bring an action against the employer; a willful failure to provide the information is punishable as contempt.",
   "note": "Iowa's deadline is 15 days, shorter than the federal 20.",
   "roll": false
  },
  {
   "id": "us_x_ia_uiwage",
   "name": "Iowa quarterly unemployment contribution and payroll report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Iowa Workforce Development",
   "brief": "Covered employers file a quarterly wage detail report and pay contributions electronically every quarter, even with no employment in the quarter.",
   "why": "You have employees in Iowa.",
   "applies": {
    "all": [
     {
      "state": [
       "IA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Contributions are due quarterly on the last day of the month following the calendar quarter. If the due date falls on a Saturday, Sunday or legal holiday, it is the next business day.",
   "weight": 80,
   "source": "us_x_ia_uiwage_src",
   "verified": true,
   "form": "Quarterly contribution and payroll report",
   "penalty": "A late report costs 0.1% of the quarter's total wages for 1-60 days late, rising to 0.5% at 241 days or more; never less than $35 per report.",
   "note": "The rule text read is the Iowa Administrative Code version of 02-05-2025.",
   "roll": false
  },
  {
   "id": "us_x_ia_unclaimed",
   "name": "Iowa unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Iowa Treasurer of State, Unclaimed Property Division",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Iowa each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "IA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "The report shall be filed annually before November 1 for the fiscal year ending on the preceding June 30. Demutualization proceeds: before May 1. Holders must exercise due diligence to find owners; no mailing is required for property under $50.",
   "weight": 55,
   "source": "us_x_ia_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "penalty": "A holder that fails to exercise due diligence in time may be charged $5 for each name and address reported, if 35% or more of the accounts are claimed within 24 months of the report.",
   "note": "The statute gives no due-diligence window in days.",
   "roll": false
  },
  {
   "id": "us_x_id_breach",
   "name": "Tell Idaho residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Idaho Attorney General",
   "brief": "A business that owns or licenses computerized personal information about Idaho residents investigates a breach promptly and, if misuse has occurred or is reasonably likely, tells the affected residents.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "ID"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as possible, without unreasonable delay (no fixed number of days for businesses)"
   },
   "dueText": "Notice must be made in the most expedient time possible and without unreasonable delay. A public agency must notify the Idaho attorney general within twenty-four hours of discovery.",
   "weight": 50,
   "source": "us_x_id_breach_src",
   "verified": true,
   "note": "The 24-hour notice to the Attorney General applies to public agencies, not private businesses.",
   "roll": false
  },
  {
   "id": "us_x_id_newhire",
   "name": "Report new hires to Idaho",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Idaho Department of Labor",
   "brief": "Every Idaho employer reports new employees, and rehired employees whose previous job ended at least 60 days before, to the Idaho Department of Labor.",
   "why": "You have employees in Idaho.",
   "applies": {
    "all": [
     {
      "state": [
       "ID"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the date of hire"
   },
   "dueText": "Report new employees to the Idaho Department of Labor within 20 days of the date of hire, as well as rehired employees if their previous employment was terminated at least 60 days prior to their first day of employment.",
   "weight": 60,
   "source": "us_x_id_newhire_src",
   "verified": true,
   "form": "Idaho New Hire Reporting form or Employer Portal",
   "note": "The page states no penalty.",
   "roll": false
  },
  {
   "id": "us_x_id_uiwage",
   "name": "Idaho quarterly unemployment insurance tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Idaho Department of Labor",
   "brief": "Covered employers report wages and pay unemployment insurance tax every quarter, online.",
   "why": "You have employees in Idaho.",
   "applies": {
    "all": [
     {
      "state": [
       "ID"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Reports and payments are due the last day of the month following the end of each quarter (wages paid in January, February and March are due April 30). There is no grace period. If the last day falls on a weekend or holiday, the next workday is the due date.",
   "weight": 80,
   "source": "us_x_id_uiwage_src",
   "verified": true,
   "form": "TAX020 and TAX026 (Employer Portal)",
   "penalty": "Late payment: 4 percent of the tax due or $20, whichever is greater, for each month or fraction of a month the tax is delinquent, never more than the tax due.",
   "note": "Read in the Idaho DOL employer handbook dated 2/17/2022 (UI Tax Information), still the file the Department links.",
   "roll": false
  },
  {
   "id": "us_x_id_unclaimed",
   "name": "Idaho unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Idaho State Treasurer, Unclaimed Property",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Idaho each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "ID"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "The report must be filed before November 1 of each year and cover the twelve months preceding July 1 of that year. Notice to the apparent owner (property of $50 or more) goes by first-class mail no more than 180 and no less than 60 days before filing.",
   "weight": 55,
   "source": "us_x_id_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "penalty": "Interest at 12% a year on the property from the date it should have been reported, plus a possible civil penalty of $200 for each day the duty is not performed, up to $5,000.",
   "roll": false
  },
  {
   "id": "us_x_il_breach",
   "name": "Tell Illinois residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Illinois Attorney General",
   "brief": "Any entity doing business in Illinois that handles nonpublic personal information must disclose a breach of personal information to affected Illinois residents. Some data collectors must also notify the Attorney General.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "IL"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay (no fixed number of days for businesses)"
   },
   "dueText": "Disclose, in the most expedient time possible and without unreasonable delay, a data security breach of personal information concerning Illinois residents.",
   "weight": 50,
   "source": "us_x_il_breach_src",
   "verified": true,
   "note": "The page quotes 45 days only for state agencies (breach of more than 250 residents). The Act's rule for private businesses breaching more than 500 residents (notice to the Attorney General) was seen only in search snippets; the statute site (ilga.gov) failed a certificate check, so it is not recorded.",
   "roll": false
  },
  {
   "id": "us_x_il_newhire",
   "name": "Report new hires and independent contractors to Illinois",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Illinois Department of Employment Security",
   "brief": "Illinois employers report each newly hired employee, and each independent contractor, to the Department of Employment Security, online, by fax or by mail.",
   "why": "You have employees in Illinois.",
   "applies": {
    "all": [
     {
      "state": [
       "IL"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days of the hire date"
   },
   "dueText": "Employers are required to report all newly hired employees within 20 calendar days of their hire date. The IDES form: employers must report each new hire, including independent contractors, within 20 days.",
   "weight": 60,
   "source": "us_x_il_newhire_src",
   "verified": true,
   "form": "IDES New Hire Reporting Form or online report",
   "penalty": "An employer's failure to report new hires may result in a civil penalty of $15 for each individual whom the employer does not report.",
   "note": "The Illinois statute site (ilga.gov) failed a certificate check from here, so the statute itself was not read.",
   "roll": false
  },
  {
   "id": "us_x_il_uiwage",
   "name": "Illinois quarterly unemployment contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Illinois Department of Employment Security",
   "brief": "Employers covered by Illinois unemployment insurance file a contribution and wage report every quarter and pay contributions with it, even in a quarter with no wages.",
   "why": "You have employees in Illinois.",
   "applies": {
    "all": [
     {
      "state": [
       "IL"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Employers must file wage reports (Form UI-3/40) and pay contributions in the month after the close of each calendar quarter, on or before April 30, July 31, October 31 and January 31.",
   "weight": 80,
   "source": "us_x_il_uiwage_src",
   "verified": true,
   "form": "UI-3/40",
   "penalty": "Late report: $5 for each $10,000 (or fraction) of total wages or $2,500 a month, whichever is less, up to $10 per $10,000 or $5,000; never less than $50. Interest on late contributions: 2% a month.",
   "note": "Employers with 25 or more employees file electronically. IDES also lists a separate monthly wage reporting duty, which was not read here.",
   "roll": false
  },
  {
   "id": "us_x_il_unclaimed",
   "name": "Illinois unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Illinois State Treasurer, Unclaimed Property Division",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Illinois each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "IL"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Before May 1 or November 1 each year, depending on the kind of holder (not confirmed)"
   },
   "dueText": "Not confirmed on an official page in this session. The Revised Uniform Unclaimed Property Act (765 ILCS 1026) sets November 1 for some holders and May 1 for others (business associations, utilities and life insurers, per the Treasurer's guidelines).",
   "weight": 55,
   "source": "us_x_il_unclaimed_src",
   "verified": false,
   "form": "Annual holder report (NAUPA format)",
   "note": "Could not read: ilga.gov failed a TLS certificate check from this environment and icash.illinoistreasurer.gov returns only a script shell. Search snippets suggest most businesses file by May 1 and banks, financial organisations and non-life insurers by November 1; confirm on the Treasurer's site before use.",
   "roll": false
  },
  {
   "id": "us_x_in_breach",
   "name": "Tell Indiana residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Indiana Attorney General, Consumer Protection Division",
   "brief": "A business whose computerized personal information is breached notifies affected Indiana residents, notifies the Attorney General, and notifies consumer reporting agencies if more than 1,000 Indiana residents are notified.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "IN"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovering the breach"
   },
   "dueText": "The disclosure must be made without unreasonable delay. The business must also notify the Attorney General's office (Breach Notification Form to DataBreach@atg.in.gov).",
   "weight": 50,
   "source": "us_x_in_breach_src",
   "verified": true,
   "penalty": "A court may impose a civil penalty of not more than $150,000 per deceptive act, plus the Attorney General's costs.",
   "note": "Search results say a 2022 amendment (HB 1351) added \"but not more than 45 days after the discovery of the breach\" to IC 24-4.9-3-3; the Attorney General's page read here does not mention it and the Indiana Code site loads by script, so the 45-day limit is not confirmed.",
   "roll": false
  },
  {
   "id": "us_x_in_newhire",
   "name": "Report new hires to Indiana",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Indiana Department of Workforce Development (Indiana New Hire Reporting Center)",
   "brief": "Indiana employers report each newly hired or rehired employee to the state directory of new hires, electronically.",
   "why": "You have employees in Indiana.",
   "applies": {
    "all": [
     {
      "state": [
       "IN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire or rehire date"
   },
   "dueText": "Employers who employ persons within the state of Indiana must electronically report all newly hired or rehired employees to the state directory within 20 days of the hire or rehire date.",
   "weight": 60,
   "source": "us_x_in_newhire_src",
   "verified": true,
   "form": "W-4 or Indiana New Hire Reporting form",
   "penalty": "The Indiana Department of Workforce Development can impose a fine of $25 for each failure to timely report an employee; if the employer and employee conspired not to report or to give a false or incomplete report, a fine of $500.",
   "roll": false
  },
  {
   "id": "us_x_in_uiwage",
   "name": "Indiana quarterly unemployment wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Indiana Department of Workforce Development",
   "brief": "All covered employers file an unemployment insurance wage report every quarter, and the payment must reach DWD by the same date.",
   "why": "You have employees in Indiana.",
   "applies": {
    "all": [
     {
      "state": [
       "IN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "All covered employers must file a quarterly report no later than the report due date: April 30, July 31, October 31 and January 31. Payment must be received (not postmarked) by the due date.",
   "weight": 80,
   "source": "us_x_in_uiwage_src",
   "verified": true,
   "form": "Quarterly unemployment wage report",
   "penalty": "$25 for each missing or inadequate report and a 10% penalty on unpaid contributions, plus 1% interest.",
   "roll": false
  },
  {
   "id": "us_x_in_unclaimed",
   "name": "Indiana unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Indiana Attorney General, Unclaimed Property Division",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Indiana each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "IN"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Life insurance: May 1. All other funds: November 1. Safekeeping items: November 30. Due diligence on property of $50 or more no more than 180 days and no less than 60 days before filing the report.",
   "weight": 55,
   "source": "us_x_in_unclaimed_src",
   "verified": false,
   "form": "Annual holder report (NAUPA format)",
   "note": "Read only in Attorney General presentations on in.gov (the deadline slide is from 2016; the 180/60-day due diligence slide from 2025). The Indiana Code site (iga.in.gov) loads by script and could not be read, so the statute (IC 32-34-1.5-20, which search results say requires filing \"before November 1\") was not confirmed.",
   "roll": false
  },
  {
   "id": "us_x_ks_breach",
   "name": "Tell Kansas residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Kansas Attorney General",
   "brief": "A business that owns or licenses computerized personal information investigates a breach and, if misuse has occurred or is reasonably likely, notifies affected Kansas residents. If more than 1,000 consumers are notified at once, it also notifies the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "KS"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay (no fixed number of days)"
   },
   "dueText": "Notice must be made in the most expedient time possible and without unreasonable delay. Notice to consumer reporting agencies (more than 1,000 consumers) also without unreasonable delay.",
   "weight": 50,
   "source": "us_x_ks_breach_src",
   "verified": true,
   "note": "Kansas law names no regulator to notify; the Attorney General enforces it.",
   "roll": false
  },
  {
   "id": "us_x_ks_newhire",
   "name": "Report new hires to Kansas",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Kansas Department of Labor (Kansas New Hire Directory)",
   "brief": "Kansas employers report each new employee, rehire or employee returning to work after 60 days or more away, to the Kansas Department of Labor.",
   "why": "You have employees in Kansas.",
   "applies": {
    "all": [
     {
      "state": [
       "KS"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 business days of hiring, rehiring or return to work, or of first paying the employee"
   },
   "dueText": "Within 20 business days of the hiring, rehiring or return to work of the newly hired employee or within 20 business days from the date the newly hired employee first receives wages or other compensation from the employer.",
   "weight": 60,
   "source": "us_x_ks_newhire_src",
   "verified": true,
   "form": "Kansas New Hire Report (K-CNS 436) or electronic report",
   "note": "The statute says 20 business days; the Department for Children and Families employer page says \"within 20 days of hire date\". The Kansas Department of Labor page refused automated access (403). No penalty was found on the pages read.",
   "roll": false
  },
  {
   "id": "us_x_ks_uiwage",
   "name": "Kansas quarterly unemployment wage report and contribution return",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Kansas Department of Labor",
   "brief": "Employers covered by Kansas unemployment insurance file a wage report and contribution return every quarter.",
   "why": "You have employees in Kansas.",
   "applies": {
    "all": [
     {
      "state": [
       "KS"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Any employer who fails to file any wage report or contribution return by the last day of the month following the close of each calendar quarter pays a penalty. Reports are treated as filed on the date they are mailed.",
   "weight": 80,
   "source": "us_x_ks_uiwage_src",
   "verified": true,
   "form": "K-CNS 100",
   "penalty": "For each month or fraction of a month late: .05% of the total wages paid in the quarter, not less than $25 nor more than $200 per report. Unpaid contributions bear interest of 1% a month.",
   "note": "Read in the statute; the Kansas Department of Labor's own pages refused automated access (403).",
   "roll": false
  },
  {
   "id": "us_x_ks_unclaimed",
   "name": "Kansas unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Kansas State Treasurer, Unclaimed Property Division",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Kansas each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "KS"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "The report must be filed before November 1 of each year and cover the 12 months next preceding July 1; life insurance companies file before May 1 for the preceding calendar year. Written notice to the owner goes not more than 120 days or less than 60 days before filing.",
   "weight": 55,
   "source": "us_x_ks_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "penalty": "$100 for each day the report is not presented, up to $5,000; a person who wilfully fails to pay or deliver the property is assessed a civil penalty of 25% of its value (K.S.A. 58-3967).",
   "note": "The Treasurer's FAQ says letters are required for properties over $100, safe deposit boxes and securities.",
   "roll": false
  },
  {
   "id": "us_x_ky_breach",
   "name": "Tell Kentucky residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Kentucky Attorney General",
   "brief": "An information holder discloses a breach of unencrypted personal information to every affected Kentucky resident, and notifies consumer reporting agencies when more than 1,000 people are notified.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "KY"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay (no fixed number of days)"
   },
   "dueText": "The disclosure shall be made in the most expedient time possible and without unreasonable delay, consistent with the legitimate needs of law enforcement or any measures necessary to determine the scope of the breach and restore the reasonable integrity of the data system.",
   "weight": 50,
   "source": "us_x_ky_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_ky_newhire",
   "name": "Report new hires to Kentucky",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Kentucky Office of the Attorney General (child support)",
   "brief": "Kentucky employers report each employee they hire, rehire or take back after a layoff, furlough or leave without pay. Since July 1, 2025 the reports go to the Office of the Attorney General.",
   "why": "You have employees in Kentucky.",
   "applies": {
    "all": [
     {
      "state": [
       "KY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hiring or return to work of the employee"
   },
   "dueText": "The employer shall provide the information within twenty (20) days of the hiring or return to work of the employee.",
   "weight": 60,
   "source": "us_x_ky_newhire_src",
   "verified": true,
   "form": "W-4 or equivalent form",
   "penalty": "After two written notices go unanswered for 20 days each (or a false or incomplete report from a conspiracy), an administrative fine of $250 per calendar month per person until the form is received.",
   "roll": false
  },
  {
   "id": "us_x_ky_uiwage",
   "name": "Kentucky quarterly unemployment wage and tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Kentucky Office of Unemployment Insurance",
   "brief": "Employers file an unemployment wage and tax report every quarter and pay what is owed when they file.",
   "why": "You have employees in Kentucky.",
   "applies": {
    "all": [
     {
      "state": [
       "KY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Reports are due by the last day of the month following the last month in each quarter: April 30, July 31, October 31 and January 31 of the following year. If the due date falls on a weekend or a legal holiday, it moves to the following business day.",
   "weight": 80,
   "source": "us_x_ky_uiwage_src",
   "verified": true,
   "form": "Quarterly unemployment wage and tax report",
   "penalty": "First late report in a calendar year: $25 if filed within 30 days of the due date, $75 if later. Each additional late report: $125, or $175 if more than 30 days late. Maximum $600 a year. Interest 1.5% a month on late payments.",
   "roll": false
  },
  {
   "id": "us_x_ky_unclaimed",
   "name": "Kentucky unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Kentucky Department of the Treasury, Unclaimed Property",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Kentucky each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "KY"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "A holder shall annually file the Unclaimed Property Report/Remit Form electronically no later than the close of business on November 1, covering the twelve months ending June 30, and turn over the property with it. Notice to owners of property over $50 goes not more than 180 days or less than 60 days before filing.",
   "weight": 55,
   "source": "us_x_ky_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "note": "The Treasury's own pages (treasury.ky.gov) refused automated access (403). Search snippets say insurers report by May 1; that was not confirmed. No penalty was read.",
   "roll": false
  },
  {
   "id": "us_x_la_breach",
   "name": "Tell Louisiana residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Louisiana Attorney General, Consumer Protection Section",
   "brief": "A business that owns or licenses computerized personal information notifies Louisiana residents whose information was, or is reasonably believed to have been, acquired by an unauthorized person, and sends written notice (with the names of those affected) to the Attorney General.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "LA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Residents: within 60 days of discovering the breach. Attorney General: within 10 days of notifying residents"
   },
   "dueText": "Residents: in the most expedient time possible and without unreasonable delay but not later than sixty days from the discovery of the breach. Attorney General: notice is timely if received within 10 days of distribution of notice to Louisiana citizens.",
   "weight": 50,
   "source": "us_x_la_breach_src",
   "verified": true,
   "penalty": "Failure to give the Attorney General timely notice may be punished by a fine of up to $5,000 per violation; each day is a separate violation.",
   "note": "A delay beyond 60 days must be explained to the Attorney General in writing within the 60 days.",
   "roll": false
  },
  {
   "id": "us_x_la_newhire",
   "name": "Report new hires to Louisiana",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Louisiana Directory of New Hires (Louisiana Department of Children and Family Services, Child Support Enforcement)",
   "brief": "Louisiana employers report each new or rehired employee to the state directory of new hires.",
   "why": "You have employees in Louisiana.",
   "applies": {
    "all": [
     {
      "state": [
       "LA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire date"
   },
   "dueText": "Employers must report all newly hired or rehired employees to the new hire reporting program within 20 days of their hire date.",
   "weight": 60,
   "source": "us_x_la_newhire_src",
   "verified": true,
   "form": "W-4, Louisiana New Hire form or electronic report",
   "penalty": "A penalty of $25.00 per employee not reported, or up to $500.00 for collusion between employer and employee.",
   "note": "Read on the Louisiana Directory of New Hires employer guide (la-newhire.com), the state reporting programme. Act 97 of 1997 is cited as the state law.",
   "roll": false
  },
  {
   "id": "us_x_la_uiwage",
   "name": "Louisiana quarterly wage and unemployment tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Louisiana Works (Louisiana Workforce Commission)",
   "brief": "Employers file a quarterly wage and unemployment tax report and pay the tax, online.",
   "why": "You have employees in Louisiana.",
   "applies": {
    "all": [
     {
      "state": [
       "LA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "days": 30
   },
   "dueText": "Wage and tax reports are due within 30 days after the end of the quarter being reported.",
   "weight": 80,
   "source": "us_x_la_uiwage_src",
   "verified": true,
   "form": "LWC ES-4 (online)",
   "penalty": "5% of the total amount due for the quarter or $25, whichever is greater, for each 30-day period (or part) the report is late, up to 25% of the amount due or $125, whichever is greater. Late payments also carry interest.",
   "note": "The official wording is \"within 30 days after the end of the quarter\", which gives July 30 and October 30 rather than the 31st; confirm with Louisiana Works before relying on the 31st.",
   "roll": false
  },
  {
   "id": "us_x_la_unclaimed",
   "name": "Louisiana unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Louisiana Department of the Treasury, Unclaimed Property",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Louisiana each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "LA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Report due \"before November 1 each year\" (deadline October 31), for the period July 1 to June 30. Written notice to the owner, for all items of $50.00 or more, not more than 120 days nor less than 60 days before.",
   "weight": 55,
   "source": "us_x_la_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "note": "The guide refers to R.S. 9:176 for interest and penalties but gives no amounts.",
   "roll": false
  },
  {
   "id": "us_x_me_breach",
   "name": "Tell Maine residents about a data breach",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Maine Attorney General (or the Department of Professional and Financial Regulation for entities it regulates)",
   "brief": "A person holding computerized personal information notifies Maine residents of a breach when misuse has occurred or is reasonably possible, and notifies the Attorney General (or its own regulator in the Department of Professional and Financial Regulation). Over 1,000 people: also the consumer reporting agencies.",
   "why": "The business holds personal information about people.",
   "applies": {
    "all": [
     {
      "state": [
       "ME"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days of becoming aware of the breach and identifying its scope"
   },
   "dueText": "As expediently as possible and without unreasonable delay; if there is no law-enforcement delay, no more than 30 days after the person becomes aware of a breach of security and identifies its scope.",
   "weight": 50,
   "source": "us_x_me_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_me_newhire",
   "name": "Report new hires and independent contractors to Maine",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Maine Department of Health and Human Services, Division of Support Enforcement and Recovery",
   "brief": "Maine employers report each new hire, and each independent contractor expected to be paid $2,500 or more in a year, to the Department of Health and Human Services.",
   "why": "You have employees in Maine.",
   "applies": {
    "all": [
     {
      "state": [
       "ME"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 7 days of the date the new employee first performs services for pay"
   },
   "dueText": "An employer shall submit a report within 7 days of the date that services for remuneration are first performed by a newly hired employee. Independent contractors: within 7 days of the earlier of first paying $2,500 in a year or signing a contract for that amount.",
   "weight": 60,
   "source": "us_x_me_newhire_src",
   "verified": true,
   "form": "W-4 or DSER New Hire report",
   "penalty": "An employer who knowingly fails to report gets a written warning for the first violation and is subject to a civil penalty of up to $200 per month for each later violation.",
   "note": "Maine's 7-day deadline is the shortest in this group. The DHHS new-hire FAQ refused automated access (403).",
   "roll": false
  },
  {
   "id": "us_x_me_pfml",
   "name": "Maine paid family and medical leave contribution report",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Maine Department of Labor, Paid Family and Medical Leave program",
   "brief": "Since January 1, 2025, Maine employers send an employer contribution report and the paid family and medical leave premiums for each employee every quarter.",
   "why": "You have employees in Maine.",
   "applies": {
    "all": [
     {
      "state": [
       "ME"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "event",
    "text": "Every quarter, on the date set by the Maine Department of Labor (not confirmed)"
   },
   "dueText": "Beginning January 1, 2025, for each employee, an employer shall remit employer contribution reports and premiums in the form and manner determined by the administrator. Employer contribution reports and premiums must be remitted quarterly.",
   "weight": 60,
   "source": "us_x_me_pfml_src",
   "verified": false,
   "form": "Employer contribution report (Maine PFML)",
   "note": "The statute sets the quarterly duty but leaves the date to the Department. Search results say reports are due by the last day of the month after each quarter, but the Department's FAQ on maine.gov refused automated access (403), so the date is not confirmed.",
   "roll": false
  },
  {
   "id": "us_x_me_uiwage",
   "name": "Maine quarterly unemployment contributions and payroll report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Maine Department of Labor, Bureau of Unemployment Compensation",
   "brief": "Every employing unit files a quarterly payroll report and pays unemployment contributions.",
   "why": "You have employees in Maine.",
   "applies": {
    "all": [
     {
      "state": [
       "ME"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly payroll reports are due on or before the last day of the month following the close of the calendar quarter for which the reports relate. Contributions are due on the same date.",
   "weight": 80,
   "source": "us_x_me_uiwage_src",
   "verified": true,
   "form": "ME UC-1",
   "penalty": "Late report: $25 or 10% of the tax due, whichever is greater. Late contributions: 1% of the unpaid amount for each month or part of a month, up to 25%, plus interest.",
   "note": "Read in the statute; maine.gov refused automated access (403) to the 2026 ME UC-1 instructions and the employer FAQ.",
   "roll": false
  },
  {
   "id": "us_x_me_unclaimed",
   "name": "Maine unclaimed property holder report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Maine Office of the State Treasurer, Unclaimed Property",
   "brief": "A business holding money or property owed to someone it cannot reach (uncashed cheques, credits, unpaid wages) for the dormancy period writes to the owner first, then reports and hands the property to Maine each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "ME"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "The report must be filed before November 1st of each year and cover the 12 months preceding July 1st. A report about life insurance policies must be filed before May 1st for the preceding calendar year.",
   "weight": 55,
   "source": "us_x_me_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format)",
   "note": "The Treasurer's reporting manual on maine.gov refused automated access (403), so the due-diligence window and penalty were not read.",
   "roll": false
  },
  {
   "id": "us_x_ma_breach",
   "name": "Notify of a data breach in Massachusetts",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Massachusetts Office of Consumer Affairs and Business Regulation and Attorney General",
   "brief": "A business that owns or licenses personal information of Massachusetts residents must notify the Attorney General, the Office of Consumer Affairs and Business Regulation and the affected residents when it knows or has reason to know of a breach.",
   "why": "The business holds personal information about Massachusetts residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as practicable and without unreasonable delay after learning of the breach"
   },
   "dueText": "Notice must be provided, as soon as practicable and without unreasonable delay, to the Attorney General, to the Office of Consumer Affairs and Business Regulation (OCABR) and to the affected resident(s).",
   "weight": 50,
   "source": "us_x_ma_breach_src",
   "verified": true,
   "note": "No fixed number of days. The notice to the two offices must include the number of Massachusetts residents affected, and a sample copy of the notice sent to residents.",
   "roll": false
  },
  {
   "id": "us_x_ma_newhire",
   "name": "Report new hires to Massachusetts",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Massachusetts Department of Revenue, Child Support Enforcement",
   "brief": "Employers report each new or rehired employee, and each independent contractor, to the Department of Revenue. Employers with 25 or more employees must report electronically.",
   "why": "You have employees in Massachusetts.",
   "applies": {
    "all": [
     {
      "state": [
       "MA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days of the employee's first day of work"
   },
   "dueText": "Employers must report newly hired employees and independent contractors to us within 14 days of their first day of work.",
   "weight": 60,
   "source": "us_x_ma_newhire_src",
   "verified": true,
   "form": "New hire report (MassTaxConnect or Form NHR)",
   "penalty": "Up to $25 for each employee, independent contractor or other recipient of periodic payments not reported or inaccurately reported; $500 each if the failure is the result of a conspiracy with the employee.",
   "note": "Massachusetts also requires retired employees to be reported within 14 days of retirement, and employees who file workers' compensation claims within 14 days of the claim. Rehires after 30 or more days off the payroll are reported again.",
   "roll": false
  },
  {
   "id": "us_x_ma_pfml",
   "name": "Massachusetts paid family and medical leave contributions",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Massachusetts Department of Revenue for the Department of Family and Medical Leave",
   "brief": "Employers file a quarterly paid family and medical leave return and send the contributions for their employees through MassTaxConnect.",
   "why": "You have employees in Massachusetts.",
   "applies": {
    "all": [
     {
      "state": [
       "MA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Employers must file a PFML return and remit PFML contributions through MassTaxConnect on or before the last day of the month following the close of the previous calendar quarter.",
   "weight": 70,
   "source": "us_x_ma_pfml_src",
   "verified": true,
   "form": "PFML return (MassTaxConnect)",
   "penalty": "Employers that fail to file, file late or do not pay may be subject to penalties under M.G.L. c. 62C, and interest is added from the due date.",
   "roll": false
  },
  {
   "id": "us_x_ma_uiwage",
   "name": "Massachusetts unemployment wage detail report and contributions",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Massachusetts Department of Unemployment Assistance",
   "brief": "Employers who must pay unemployment insurance file a quarterly employment and wage detail report and pay contributions through the Unemployment Services for Employers account.",
   "why": "You have employees in Massachusetts.",
   "applies": {
    "all": [
     {
      "state": [
       "MA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarter 1 is due by 3 p.m. on April 30; Quarter 2 by 3 p.m. on July 31; Quarter 3 by 3 p.m. on October 31; Quarter 4 by 3 p.m. on January 31.",
   "weight": 80,
   "source": "us_x_ma_uiwage_src",
   "verified": true,
   "form": "Employment and Wage Detail Report (UI Online)",
   "penalty": "Late payments are subject to a 12% interest rate until they are fully paid.",
   "note": "The page names the interest charge only; a late-filing penalty amount was not stated on the current DUA pages read.",
   "roll": false
  },
  {
   "id": "us_x_ma_unclaimed",
   "name": "Massachusetts unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Massachusetts State Treasurer, Unclaimed Property Division",
   "brief": "A business holding money or property that belongs to someone it has not been able to reach for 3 years reports it and turns it over to the Treasurer once a year. Holders must first register for a Holder ID.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "All holders: period ending June 30, due diligence on or before September 1, report and remittance due November 1. Life insurers: period ending December 31, due diligence on or before March 1, due May 1.",
   "weight": 55,
   "source": "us_x_ma_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "penalty": "Late reports are subject to penalties and interest as prescribed in Massachusetts General Law Ch. 200A. Extensions of up to 60 days may be requested before the deadline.",
   "note": "Due-diligence letter: by first-class mail to every owner with property of $100 or more, at least 60 days before filing the report (guidelines PDF). Tangible property is delivered between May 1 and June 30 of the following year. The guidelines give no penalty amount.",
   "roll": false
  },
  {
   "id": "us_x_md_breach",
   "name": "Notify of a data breach in Maryland",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Maryland Office of the Attorney General",
   "brief": "A business that owns or licenses computerised personal information of Maryland residents and has a security breach likely to lead to misuse must notify the affected people, and must notify the Attorney General first.",
   "why": "The business holds personal information about Maryland residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MD"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Notify the Attorney General first, then the affected people as soon as reasonably practicable and not later than 45 days after discovering the breach"
   },
   "dueText": "As soon as reasonably practicable, but not later than 45 days after the business discovers or is notified of the breach. Prior to notifying individuals, the business shall notify the Office of the Attorney General.",
   "weight": 50,
   "source": "us_x_md_breach_src",
   "verified": true,
   "note": "A business that only maintains the data for its owner must tell the owner within 10 days. Notice may be delayed at the request of law enforcement.",
   "roll": false
  },
  {
   "id": "us_x_md_newhire",
   "name": "Report new hires to Maryland",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Maryland Department of Human Services, Child Support Administration",
   "brief": "Employers tell the Maryland State Directory of New Hires about each employee they hire or rehire. The information is used to find parents who owe child support and to stop unemployment benefits being paid to people who are back at work.",
   "why": "You have employees in Maryland.",
   "applies": {
    "all": [
     {
      "state": [
       "MD"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hiring or rehiring the employee"
   },
   "dueText": "Employers are required by law to report newly hired or rehired employees within 20 days.",
   "weight": 60,
   "source": "us_x_md_newhire_src",
   "verified": true,
   "form": "Maryland State Directory of New Hires report",
   "penalty": "Maryland law sets a limit of $20 per month a violation occurs, or $500 if the failure to report is the result of a conspiracy between the employer and the employee.",
   "note": "Employers who report electronically send two transmissions a month, 12 to 16 days apart (New Hires FAQs). A worker away from the payroll for at least 60 consecutive days is reported again on return.",
   "roll": false
  },
  {
   "id": "us_x_md_pfml",
   "name": "Maryland FAMLI quarterly wage and hour report and contributions",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Maryland Department of Labor, Family and Medical Leave Insurance (FAMLI)",
   "brief": "From January 2027, Maryland employers collect employee contributions for paid family and medical leave, add their own share, and each quarter file a wage and hour report and remit the total. The 2027 rate is 0.9% of wages, split equally; employers with fewer than 15 employees pay no employer share.",
   "why": "You have employees in Maryland.",
   "applies": {
    "all": [
     {
      "state": [
       "MD"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "QWHRs are due by the end of the month following the most recent calendar quarter: April 30, July 31, October 31, January 31. Your contribution payment and QWHR are due on the same day. The first contribution payment, covering wages paid January 1 – March 31, 2027, will be due April 30, 2027.",
   "weight": 70,
   "source": "us_x_md_pfml_src",
   "verified": true,
   "form": "Quarterly Wage and Hour Report (QWHR)",
   "penalty": "Contributions must be paid on or before the quarterly due date to avoid penalties and interest (amounts not stated).",
   "note": "Starts with wages paid from January 1, 2027; the first report and payment are due April 30, 2027. Employers with an approved private plan still file the quarterly report. Employer size counts all employees under the same EIN, inside and outside Maryland.",
   "roll": false
  },
  {
   "id": "us_x_md_uiwage",
   "name": "Maryland unemployment insurance contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Maryland Department of Labor, Division of Unemployment Insurance",
   "brief": "Employers file a quarterly contribution report listing wages paid and pay the unemployment insurance tax, through the BEACON portal.",
   "why": "You have employees in Maryland.",
   "applies": {
    "all": [
     {
      "state": [
       "MD"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Contribution reports and payments are due: Quarter 1 - April 30; Quarter 2 - July 31; Quarter 3 - October 31; Quarter 4 - January 31.",
   "weight": 80,
   "source": "us_x_md_uiwage_src",
   "verified": true,
   "form": "Quarterly contribution and wage report (BEACON)",
   "penalty": "Interest at 1.5% per month on the late contribution payment, and a penalty of $35 per quarter that is past due.",
   "roll": false
  },
  {
   "id": "us_x_md_unclaimed",
   "name": "Maryland unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Comptroller of Maryland, Unclaimed Property Division",
   "brief": "A business holding money that belongs to someone else and has gone unclaimed past the dormancy period (uncashed cheques, credits, wages) reports it and sends it to the Comptroller once a year. Maryland is a report-and-remit state.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MD"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Corporations, public entities, financial institutions and others: period ending June 30, report and remittance due October 31. All insurance companies: period ending December 31, due April 30.",
   "weight": 55,
   "source": "us_x_md_unclaimed_src",
   "verified": true,
   "form": "Holder report (NAUPA format)",
   "penalty": "Late reporting penalties are automatically assessed: 15% of the remitted report value, for holders without an approved extension. An extension of up to 90 days may be requested by email before the deadline.",
   "note": "Insurance companies report by April 30 instead. The due-diligence letter window was not stated on the pages read. The Comptroller's holder pages are now a JavaScript application at claimitmd.gov; the text was read from that site's own page code.",
   "roll": false
  },
  {
   "id": "us_x_mi_breach",
   "name": "Notify of a data breach in Michigan",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Michigan (Identity Theft Protection Act)",
   "brief": "A business that owns or licenses a database of personal information of Michigan residents must notify affected residents of a security breach unless it determines the breach is not likely to cause substantial loss or injury or identity theft. After notifying, it must also tell the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about Michigan residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MI"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovering the breach"
   },
   "dueText": "A person or agency shall provide any notice required under this section without unreasonable delay.",
   "weight": 50,
   "source": "us_x_mi_breach_src",
   "verified": true,
   "penalty": "A person who knowingly fails to give notice may be ordered to pay a civil fine of not more than $250 for each failure, up to $750,000 in total for one breach.",
   "note": "No fixed number of days. A delay is allowed to find the scope of the breach or at the request of law enforcement.",
   "roll": false
  },
  {
   "id": "us_x_mi_newhire",
   "name": "Report new hires to Michigan",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Michigan New Hires Operation Center (Office of Child Support)",
   "brief": "Employers report each new or rehired employee to the state directory of new hires, which uses it to enforce child support.",
   "why": "You have employees in Michigan.",
   "applies": {
    "all": [
     {
      "state": [
       "MI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hire at the latest (federal limit; Michigan's own deadline not confirmed)"
   },
   "dueText": "Federal law: not later than 20 days after the date the employer hires the employee, or, for electronic reporters, by 2 monthly transmissions not less than 12 days nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_mi_newhire_src",
   "verified": false,
   "form": "New hire report (Michigan New Hires Operation Center)",
   "note": "michigan.gov refused automated access (Access Denied, 403) and the new-hire portal (mi-newhire.com) is a script-only application whose help pages also returned 403. The Michigan statute setting the deadline was not found on legislature.mi.gov. The date shown is the federal outer limit that binds every state; Michigan may set a shorter one. Penalty not read.",
   "roll": false
  },
  {
   "id": "us_x_mi_uiwage",
   "name": "Michigan unemployment insurance quarterly contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Michigan Unemployment Insurance Agency",
   "brief": "Contributing employers file a quarterly contribution report and pay the unemployment tax on the wages paid in the quarter.",
   "why": "You have employees in Michigan.",
   "applies": {
    "all": [
     {
      "state": [
       "MI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1,
    "day": 25
   },
   "dueText": "An employer shall submit a quarterly report and pay the contributions due on wages paid during the calendar quarter on or before the twenty-fifth day of the month next following the last day of the calendar quarter.",
   "weight": 80,
   "source": "us_x_mi_uiwage_src",
   "verified": true,
   "form": "Quarterly contribution and wage report (MiUI)",
   "penalty": "Contributions paid after the last day of the month containing the due date accrue interest from the day after the due date (Rule 121).",
   "note": "Read in the Michigan Administrative Code (R 421.121) because michigan.gov refused automated access (403). The Agency's late-report penalty amounts were not read.",
   "roll": false
  },
  {
   "id": "us_x_mi_unclaimed",
   "name": "Michigan unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Michigan Department of Treasury, Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned (uncashed cheques, credits, unpaid wages and similar) reports it to the state every year for the 12 months ending March 31.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MI"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      7,
      1
     ]
    ]
   },
   "dueText": "The report must be filed on or before July 1 of each year for the 12-month period ending on the immediately preceding March 31. The administrator may extend the filing date for up to 60 days on written request.",
   "weight": 55,
   "source": "us_x_mi_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "note": "Due-diligence letter: not less than 60 days or more than 365 days before filing, to each apparent owner with a known address whose property is $50 or more (MCL 567.238(5)). Read in the statute because michigan.gov (Treasury) refused automated access; the penalty section was not read.",
   "roll": false
  },
  {
   "id": "us_x_mn_breach",
   "name": "Notify of a data breach in Minnesota",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Minnesota (enforced by the Attorney General)",
   "brief": "A business that owns or licenses personal information must tell Minnesota residents whose unencrypted personal information was, or is reasonably believed to have been, acquired by an unauthorized person.",
   "why": "The business holds personal information about Minnesota residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MN"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay; consumer reporting agencies within 48 hours when more than 500 people are notified"
   },
   "dueText": "The disclosure must be made in the most expedient time possible and without unreasonable delay. If more than 500 persons are to be notified at one time, the business shall also notify, within 48 hours, all nationwide consumer reporting agencies.",
   "weight": 50,
   "source": "us_x_mn_breach_src",
   "verified": true,
   "note": "No fixed number of days for residents. The 48-hour notice goes to the consumer reporting agencies, not to the Attorney General.",
   "roll": false
  },
  {
   "id": "us_x_mn_newhire",
   "name": "Report new hires to Minnesota",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Minnesota Department of Children, Youth, and Families",
   "brief": "Employers report each new or rehired employee who lives or works in Minnesota to the state's new hire reporting system. A hire expected to last under two months and earn under $250 a month need not be reported.",
   "why": "You have employees in Minnesota.",
   "applies": {
    "all": [
     {
      "state": [
       "MN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days of the date of hiring"
   },
   "dueText": "Employers shall submit reports required under this subdivision within 20 calendar days of the date of hiring of the employee.",
   "weight": 60,
   "source": "us_x_mn_newhire_src",
   "verified": true,
   "form": "New hire report (Minnesota New Hire Reporting Center)",
   "penalty": "After a written notice of noncompliance, a later violation carries a civil penalty of $25 for each intentionally unreported employee; $500 for each if the failure results from a conspiracy between employer and employee.",
   "note": "The New Hire Reporting Center FAQ gives the same 20 days and lets employers report online, by fax or mail.",
   "roll": false
  },
  {
   "id": "us_x_mn_pfml",
   "name": "Minnesota Paid Leave wage detail report and premiums",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Minnesota Department of Employment and Economic Development, Paid Leave",
   "brief": "Employers file a quarterly wage detail report for Minnesota Paid Leave, listing each employee's wages and hours, and pay the premiums the department computes from it.",
   "why": "You have employees in Minnesota.",
   "applies": {
    "all": [
     {
      "state": [
       "MN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "The report is due and must be received by the commissioner on or before the last day of the month following the end of the calendar quarter. Premiums must be received on or before the last day of the month following the end of the calendar quarter.",
   "weight": 70,
   "source": "us_x_mn_pfml_src",
   "verified": true,
   "form": "Paid Leave quarterly wage detail report",
   "penalty": "Late fee of $10 per employee, not less than $250; it doubles if the report is not received within 30 days after demand.",
   "note": "Premiums are covered in Minnesota Statutes 268B.14. The start date of premiums was not read on the pages opened.",
   "roll": false
  },
  {
   "id": "us_x_mn_uiwage",
   "name": "Minnesota unemployment insurance wage detail report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Minnesota Department of Employment and Economic Development, Unemployment Insurance",
   "brief": "Employers file a quarterly wage detail report listing each employee's wages, and pay the unemployment tax. A zero-wage report is needed for quarters with no wages.",
   "why": "You have employees in Minnesota.",
   "applies": {
    "all": [
     {
      "state": [
       "MN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "A quarterly wage detail report must be received on or before the last day of the month following the end of the calendar quarter. If the due date falls on a weekend or state holiday, the report is due the next business day.",
   "weight": 80,
   "source": "us_x_mn_uiwage_src",
   "verified": true,
   "form": "Quarterly wage detail report",
   "penalty": "Late fee of $10 per employee, never less than $250; it doubles if the report is not received within 30 days of the late fee notice.",
   "note": "The Unemployment Insurance due-dates page refused automated access (bot check); the Employer Handbook page was read instead.",
   "roll": false
  },
  {
   "id": "us_x_mn_unclaimed",
   "name": "Minnesota unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Minnesota Department of Commerce, Unclaimed Property Program",
   "brief": "Anyone holding unclaimed property belonging to Minnesota residents (uncashed cheques, accounts, insurance refunds, wages) reports and remits it once a year, even if not registered to do business in Minnesota.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MN"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Businesses and other organizations are required to report and remit unclaimed property by November 1st. Life insurance companies and other fraternal organizations are required to report and remit unclaimed property by October 1st.",
   "weight": 55,
   "source": "us_x_mn_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "penalty": "Willfully failing to report is a misdemeanor; refusing to pay or deliver is a gross misdemeanor. Property not paid or delivered by the due date may be charged interest at 12% per year on its value.",
   "note": "Due-diligence letter: not more than 120 days before filing the report, to owners with a usable address whose property is $100 or more (2026 Holder Reporting Guide). Life insurers and fraternal organizations report by October 1.",
   "roll": false
  },
  {
   "id": "us_x_mo_breach",
   "name": "Notify of a data breach in Missouri",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Missouri Attorney General",
   "brief": "A business that owns or licenses personal information of Missouri residents must notify affected consumers of a breach. If it notifies more than 1,000 consumers at one time, it must also notify the Attorney General's office and the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about Missouri residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MO"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay; the Attorney General too when more than 1,000 consumers are notified"
   },
   "dueText": "The disclosure notification shall be made without unreasonable delay. If notice is provided to more than one thousand consumers at one time, the person shall notify, without unreasonable delay, the attorney general's office and all consumer reporting agencies.",
   "weight": 50,
   "source": "us_x_mo_breach_src",
   "verified": true,
   "penalty": "For a willful and knowing violation the Attorney General may seek a civil penalty not exceeding $150,000 per breach or series of similar breaches.",
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_mo_newhire",
   "name": "Report new hires to Missouri",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Missouri Department of Social Services, Family Support Division (with the Department of Revenue)",
   "brief": "Every employer doing business in Missouri sends a copy of each new employee's W-4, or a form with the same data, to the state new hire registry. Rehires who must fill out a new W-4 are reported again.",
   "why": "You have employees in Missouri.",
   "applies": {
    "all": [
     {
      "state": [
       "MO"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days after the employee is hired (the earlier of signing the W-4 or the first day of work)"
   },
   "dueText": "Employers must submit their new hire reports within 20 days after the employee is hired. Employers who submit reports magnetically or electronically shall submit the reports in two monthly transmissions not more than sixteen days apart.",
   "weight": 60,
   "source": "us_x_mo_newhire_src",
   "verified": true,
   "form": "New hire report (W-4 copy or equivalent)",
   "penalty": "An employer who intentionally fails to report is guilty of an infraction and fined not more than $25; $350 for each failure if it results from a conspiracy between employer and employee.",
   "note": "Under RSMo 285.300 the hire date is the earlier of the date the employee signs the W-4 or the first day of work.",
   "roll": false
  },
  {
   "id": "us_x_mo_uiwage",
   "name": "Missouri quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Missouri Department of Labor and Industrial Relations, Division of Employment Security",
   "brief": "Employers file a quarterly contribution and wage report and pay unemployment tax. A report is required even with no payroll in the quarter.",
   "why": "You have employees in Missouri.",
   "applies": {
    "all": [
     {
      "state": [
       "MO"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "The report should be filed and contributions paid by the last day of the month following the end of each calendar quarter to be considered timely.",
   "weight": 80,
   "source": "us_x_mo_uiwage_src",
   "verified": true,
   "form": "Quarterly Contribution and Wage Report",
   "penalty": "If the report is not filed by the last day of the month after it became delinquent: 10 percent of the contributions due or $100, whichever is greater, each month it remains unfiled, up to 20 percent or $200 per quarter. Interest also accrues.",
   "roll": false
  },
  {
   "id": "us_x_mo_unclaimed",
   "name": "Missouri unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Missouri State Treasurer, Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned reports it to the State Treasurer every year, for the year to June 30.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MO"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "November 1, using a June 30 cutoff (all holders except life insurance companies); May 1, using a December 31 cutoff (life insurance companies only).",
   "weight": 55,
   "source": "us_x_mo_unclaimed_src",
   "verified": true,
   "form": "Report of Unclaimed Property",
   "penalty": "If the holder did not use reasonable diligence to find the owner, the Treasurer may impose a penalty of up to 20 percent of the value of the property later returned to the owner. The Treasurer may extend the deadline by 30-day periods on written request.",
   "note": "Due diligence: for owners owed $50 or more, within one year before reporting (RSMo 447.539). Statute wording: the report shall be filed before November first each year.",
   "roll": false
  },
  {
   "id": "us_x_ms_breach",
   "name": "Notify of a data breach in Mississippi",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Mississippi (enforced by the Attorney General)",
   "brief": "A person who conducts business in Mississippi must tell all affected residents of a breach of security of their personal information, unless an investigation finds harm is not reasonably likely.",
   "why": "The business holds personal information about Mississippi residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MS"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay, after the investigation into the scope of the breach"
   },
   "dueText": "The disclosure shall be made without unreasonable delay, subject to the completion of an investigation by the person to determine the nature and scope of the incident, to identify the affected individuals, or to restore the reasonable integrity of the data system.",
   "weight": 50,
   "source": "us_x_ms_breach_src",
   "verified": false,
   "note": "Mississippi's code is not published on a state site; the current wording of Miss. Code 75-24-29 was read in its reprint inside 2026 Senate Bill 2128, which would have added notice to the Attorney General and died in committee on 3 February 2026. So there is no Attorney General notice and no fixed number of days. The text was read in a reprint of the law inside a 2026 bill that did not pass, not in the statute itself: confirm it on the Mississippi Code.",
   "roll": false
  },
  {
   "id": "us_x_ms_newhire",
   "name": "Report new hires to Mississippi",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Mississippi Department of Human Services, Division of Child Support Enforcement",
   "brief": "All employers report basic information about each newly hired or rehired employee to the state directory of new hires, online at ms-newhire.com, by fax or by mail.",
   "why": "You have employees in Mississippi.",
   "applies": {
    "all": [
     {
      "state": [
       "MS"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 days of the hire date"
   },
   "dueText": "All employers are required to report basic information about newly-hired personnel within 15 days.",
   "weight": 60,
   "source": "us_x_ms_newhire_src",
   "verified": true,
   "form": "New hire report (ms-newhire.com)",
   "penalty": "$25 per case (incident), or up to $500 for collusion between employer and worker.",
   "note": "Mississippi's deadline (15 days) is shorter than the federal 20 days. The state directory site cites Miss. Code 93-11-101.",
   "roll": false
  },
  {
   "id": "us_x_ms_uiwage",
   "name": "Mississippi unemployment insurance quarterly wage and tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Mississippi Department of Employment Security",
   "brief": "Employers file a quarterly wage report and pay unemployment insurance tax online with MDES.",
   "why": "You have employees in Mississippi.",
   "applies": {
    "all": [
     {
      "state": [
       "MS"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly wage reports and taxes are due by the last day of the month following the close of each calendar quarter: April 30th, July 31st, October 31st, January 31st. If a date falls on a weekend, the due date will be on the next business day.",
   "weight": 80,
   "source": "us_x_ms_uiwage_src",
   "verified": true,
   "form": "Quarterly wage and contribution report",
   "penalty": "Interest of 1 percent per month; a late-filing penalty of 10 percent of tax due starting 30 days after the due date, and a late-payment penalty of a further 10 percent 60 days after the due date (total generally not more than 20 percent a quarter).",
   "roll": false
  },
  {
   "id": "us_x_ms_unclaimed",
   "name": "Mississippi unclaimed property report (every third year)",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Mississippi State Treasurer, Unclaimed Property Division",
   "brief": "Businesses holding property presumed abandoned (generally after five years) report it to the State Treasurer every third year, and may report at any time items reach the dormancy period. Reports must be filed electronically.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MS"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before November 1 every third year (2026, 2029, 2032 ...), for property as of the June 30 before"
   },
   "dueText": "Mississippi law requires businesses and organizations to file the Unclaimed Property Report every third year (2023, 2026, 2029 etc). The report shall be filed before November 1 of each year in which a report is required as of June 30 next preceding.",
   "weight": 55,
   "source": "us_x_ms_unclaimed_src",
   "verified": true,
   "form": "Holder report (NAUPA format, online)",
   "penalty": "Willful failure to report: a fine of $5 for each day the report is withheld, up to $100. Anyone who fails to report, pay or deliver on time also pays interest of 1% per month on the property.",
   "note": "The Treasurer suggests sending due-diligence letters at least 60 days before reporting, for property of $50 or more (FAQ, a suggestion rather than a stated legal window). The instructions PDF is dated 2020; the current holder page says holders may report any time items meet the five-year dormancy.",
   "roll": false
  },
  {
   "id": "us_x_mt_breach",
   "name": "Notify of a data breach in Montana",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Montana Attorney General, Office of Consumer Protection",
   "brief": "A business that owns or licenses computerised personal information must tell Montana residents whose unencrypted personal information was, or is reasonably believed to have been, acquired by an unauthorized person, and send a copy of the notice to the Attorney General at the same time.",
   "why": "The business holds personal information about Montana residents.",
   "applies": {
    "all": [
     {
      "state": [
       "MT"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay; a copy to the Attorney General's consumer protection office at the same time"
   },
   "dueText": "The disclosure must be made without unreasonable delay. Any person or business required to issue a notification shall simultaneously submit an electronic copy of the notification and a statement of the date and method of distribution to the attorney general's consumer protection office.",
   "weight": 50,
   "source": "us_x_mt_breach_src",
   "verified": true,
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_mt_newhire",
   "name": "Report new hires to Montana",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Montana Department of Public Health and Human Services, Child Support Services Division",
   "brief": "Employers report newly hired and rehired employees (rehired after more than 60 days away) to the Montana New Hire Reporting Program, online, electronically or on paper.",
   "why": "You have employees in Montana.",
   "applies": {
    "all": [
     {
      "state": [
       "MT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's date of hire or rehire"
   },
   "dueText": "Employers must report newly hired and rehired employees within twenty (20) days from the date of hire.",
   "weight": 60,
   "source": "us_x_mt_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "MCA 40-5-922 gives the same rule: written reports within 20 days of hire or rehire; electronic reports may be two transmissions a month 12 to 16 days apart. No penalty amount was stated on the pages read.",
   "roll": false
  },
  {
   "id": "us_x_mt_uiwage",
   "name": "Montana unemployment insurance quarterly wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Montana Department of Labor and Industry, Unemployment Insurance Division",
   "brief": "Employers file a quarterly unemployment insurance wage report and pay the tax due, through UI eServices for Employers.",
   "why": "You have employees in Montana.",
   "applies": {
    "all": [
     {
      "state": [
       "MT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly wage report and payment must be submitted/postmarked by April 30, July 31, October 31 and January 31. If the due date is on a weekend or holiday, the next business day becomes the due date.",
   "weight": 80,
   "source": "us_x_mt_uiwage_src",
   "verified": true,
   "form": "UI quarterly wage report (UI eServices)",
   "penalty": "Late filing penalty of $25; interest on tax not paid when due of 1.5% per month (18% a year). Failing to file electronically may bring a $25 late fee.",
   "note": "Employer Handbook revised January 2025.",
   "roll": false
  },
  {
   "id": "us_x_mt_unclaimed",
   "name": "Montana unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Montana Department of Revenue, Unclaimed Property",
   "brief": "A business holding property presumed abandoned reports and delivers it to the Department of Revenue each year, for the 12 months to June 30.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "MT"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "November 1, using a June 30 cut off (all holders except life insurance companies); May 1, using a December 31 cut off (life insurance companies only).",
   "weight": 55,
   "source": "us_x_mt_unclaimed_src",
   "verified": true,
   "form": "Report of Property Presumed Unclaimed (Form UCH-1)",
   "penalty": "Interest at 12% a year, plus a civil penalty of $100 for each day the report, payment or delivery is withheld, up to $2,500; $1,000 a day up to $25,000 plus 25% of the property if willful.",
   "note": "Due-diligence letter: not more than 120 days and not less than 60 days before filing, to owners with a usable address whose property is $50 or more (MCA 70-9-808(5)).",
   "roll": false
  },
  {
   "id": "us_x_ne_breach",
   "name": "Notify of a data breach in Nebraska",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Nebraska Attorney General",
   "brief": "A business that owns or licenses computerized personal information of Nebraska residents must investigate a breach promptly and, if misuse has occurred or is reasonably likely, notify the affected residents and the Attorney General.",
   "why": "The business holds personal information about Nebraska residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NE"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as possible and without unreasonable delay; the Attorney General no later than the residents"
   },
   "dueText": "Notice shall be made as soon as possible and without unreasonable delay. The entity shall also, not later than the time when notice is provided to the Nebraska resident, provide notice of the breach to the Attorney General.",
   "weight": 50,
   "source": "us_x_ne_breach_src",
   "verified": true,
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_ne_newhire",
   "name": "Report new hires to Nebraska",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Nebraska Department of Health and Human Services, Child Support Enforcement",
   "brief": "Employers report new hires, rehires, temporary or seasonal workers and independent contractors to the Nebraska State Directory of New Hires.",
   "why": "You have employees in Nebraska.",
   "applies": {
    "all": [
     {
      "state": [
       "NE"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hiring"
   },
   "dueText": "Employers must report the following within 20 days: employee name, address, Social Security number and date of hire, and the employer's name, address and FEIN.",
   "weight": 60,
   "source": "us_x_ne_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "The department may levy a fine not to exceed $25 for each employee not reported, depending on the employer's good-faith efforts to comply.",
   "note": "Nebraska also requires independent contractors to be reported (Neb. Rev. Stat. 48-2302).",
   "roll": false
  },
  {
   "id": "us_x_ne_uiwage",
   "name": "Nebraska quarterly combined tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Nebraska Department of Labor",
   "brief": "Employers file a quarterly combined tax report and wage report and pay the unemployment combined tax, through NEworks or on paper. Both reports must be filed for the filing to count as on time.",
   "why": "You have employees in Nebraska.",
   "applies": {
    "all": [
     {
      "state": [
       "NE"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Reports and payment are due by the end of the month following each quarter end date. The tax and wage reports must both be submitted before the deadline to be considered timely.",
   "weight": 80,
   "source": "us_x_ne_uiwage_src",
   "verified": true,
   "form": "Combined Tax Report (UI-11T) and Wage Report (UI-11W)",
   "penalty": "A report not filed by the tenth day of the second month after the quarter: penalty of 0.1% of total gross wages paid in the quarter, not less than $25 nor more than $200. Interest on late combined tax is 1.5% a month.",
   "roll": false
  },
  {
   "id": "us_x_ne_unclaimed",
   "name": "Nebraska unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Nebraska State Treasurer, Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned reports and remits it to the State Treasurer each year, for the year to June 30.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NE"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "The report shall be filed before November 1 of each year as of June 30 next preceding, but the report of life insurance corporations shall be filed before May 1 of each year as of December 31 next preceding.",
   "weight": 55,
   "source": "us_x_ne_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "note": "Due diligence: the Treasurer's holder site says a notice goes to the owner's last known address at least 60 days and not more than 120 days before the reporting deadline (read in the site's page code). The penalty section of the Act was not found.",
   "roll": false
  },
  {
   "id": "us_x_nh_breach",
   "name": "Notify of a data breach in New Hampshire",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "New Hampshire Attorney General (or the business's regulator)",
   "brief": "A business that learns of a breach of computerized personal information must investigate and, if misuse has occurred or is reasonably likely or it cannot tell, notify the affected people and the New Hampshire Attorney General's office (or its regulator, for regulated businesses).",
   "why": "The business holds personal information about New Hampshire residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NH"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as possible after determining misuse is likely"
   },
   "dueText": "The person shall notify the affected individuals as soon as possible. The disclosure shall be made to affected individuals as quickly as possible, after the determination required under this section. All other persons shall notify the New Hampshire attorney general's office.",
   "weight": 50,
   "source": "us_x_nh_breach_src",
   "verified": true,
   "note": "No fixed number of days. Businesses subject to RSA 358-A:3, I notify their regulator instead of the Attorney General. Read with the WebFetch tool because gc.nh.gov closed plain connections.",
   "roll": false
  },
  {
   "id": "us_x_nh_newhire",
   "name": "Report new hires to New Hampshire",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "New Hampshire Employment Security",
   "brief": "Employers report each new hire and rehire to New Hampshire Employment Security for the State Directory of New Hires, and also independent contractors whose pay for non-casual services is expected to exceed $2,500.",
   "why": "You have employees in New Hampshire.",
   "applies": {
    "all": [
     {
      "state": [
       "NH"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hiring or rehiring"
   },
   "dueText": "Any employing unit shall report to the department the hiring of new employees and the rehiring of former employees within 20 days of such action; electronic reports by 2 monthly transmissions not less than 12 days nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_nh_newhire_src",
   "verified": true,
   "form": "New Hire Report (NHES 0085)",
   "note": "New Hampshire also requires reporting of independent contractors paid over $2,500 for non-casual services. The NHES new-hire guide (which states the penalties) refused automated access (403), so no penalty is recorded. The statute was read with the WebFetch tool because gc.nh.gov closed plain connections (empty reply).",
   "roll": false
  },
  {
   "id": "us_x_nh_uiwage",
   "name": "New Hampshire quarterly tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "New Hampshire Employment Security",
   "brief": "Employers file an Employer Tax and Wage Report and pay unemployment contributions each quarter.",
   "why": "You have employees in New Hampshire.",
   "applies": {
    "all": [
     {
      "state": [
       "NH"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Every employer on or before the date contributions are due shall complete and file an Employer Tax and Wage Report (Emp 303.02). Contributions are due on or before the last day of the month following the calendar quarter during which said wages are paid (Emp 304.01).",
   "weight": 80,
   "source": "us_x_nh_uiwage_src",
   "verified": true,
   "form": "Employer Tax and Wage Report (NHES WebTax)",
   "penalty": "Late filing fee of 10 percent of the contributions due, but not less than $25 for each failure (RSA 282-A:142); unpaid contributions bear interest of 1 percent a month (RSA 282-A:141).",
   "note": "Read in the NHES administrative rules (Emp 100-500) because nhes.nh.gov refused automated access (403). The rules were read with the WebFetch tool because gc.nh.gov closed plain connections.",
   "roll": false
  },
  {
   "id": "us_x_nh_unclaimed",
   "name": "New Hampshire abandoned property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "New Hampshire State Treasury, Abandoned and Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned as of June 30 reports it to the State Treasury each year.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NH"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "The report shall be filed before November 1 of each year for property presumed to be abandoned as of June 30 of that year; insurance companies file before May 1 for property presumed abandoned as of December 31 of the preceding year.",
   "weight": 55,
   "source": "us_x_nh_unclaimed_src",
   "verified": true,
   "form": "Form T-1",
   "penalty": "Interest at 18 percent a year on the property, and a civil penalty of $100 for each day the report is withheld, up to $5,000, after written notice and 30 days to cure (Tre 303.08).",
   "note": "Due-diligence letter: no sooner than 120 days but no later than 60 days before reporting (Tre 303.01(e)(2)), for property of $50 or more (RSA 471-C:19). Read with the WebFetch tool because gc.nh.gov closed plain connections.",
   "roll": false
  },
  {
   "id": "us_x_nv_breach",
   "name": "Notify of a data breach in Nevada",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Nevada (NRS chapter 603A)",
   "brief": "A data collector that owns or licenses computerized personal information must tell Nevada residents whose unencrypted personal information was, or is reasonably believed to have been, acquired by an unauthorized person.",
   "why": "The business holds personal information about Nevada residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NV"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay"
   },
   "dueText": "The disclosure must be made in the most expedient time possible and without unreasonable delay. If notice goes to more than 1,000 persons at one time, the data collector shall also notify, without unreasonable delay, the nationwide consumer reporting agencies.",
   "weight": 50,
   "source": "us_x_nv_breach_src",
   "verified": true,
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_nv_newhire",
   "name": "Report new hires to Nevada",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Nevada Department of Employment, Training and Rehabilitation, Employment Security Division",
   "brief": "Every employer who hires, or rehires 60 days or more after separation, an employee who needs a W-4 reports the hire to the Employment Security Division. Secure file transfer is preferred; paper forms may be mailed or faxed.",
   "why": "You have employees in Nevada.",
   "applies": {
    "all": [
     {
      "state": [
       "NV"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hire or rehire, or twice a month if reporting electronically"
   },
   "dueText": "This information must be reported for each employee within 20 days of hire/re-hire OR twice per month if reporting electronically.",
   "weight": 60,
   "source": "us_x_nv_newhire_src",
   "verified": true,
   "form": "New hire report (DETR)",
   "penalty": "NRS 606.120 lets the Division adopt by regulation a civil penalty of less than $25 for an employer who fails to report, after notice and a hearing.",
   "note": "Read on the Division of Welfare and Supportive Services page; the DETR new-hire pages refused automated access (403). NRS 606.120 ties the deadline to the federal time in 42 U.S.C. 653a.",
   "roll": false
  },
  {
   "id": "us_x_nv_uiwage",
   "name": "Nevada unemployment insurance quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Nevada Department of Employment, Training and Rehabilitation, Employment Security Division",
   "brief": "Employers file a quarterly contribution and wage report electronically with the Employment Security Division and pay unemployment contributions on the wages paid in the quarter.",
   "why": "You have employees in Nevada.",
   "applies": {
    "all": [
     {
      "state": [
       "NV"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Contributions are due and must be paid on or before the last day of the calendar month next following the close of the quarter for which they are payable.",
   "weight": 80,
   "source": "us_x_nv_uiwage_src",
   "verified": false,
   "form": "Quarterly contribution and wage report",
   "penalty": "A forfeit of $5 for each report not submitted on time; a wage report more than 10 days late also bears interest of one-tenth of 1 percent of the taxable wages for each month until filed.",
   "note": "The regulation (NAC 612.260) fixes the payment date; the report itself is due \"within the time prescribed by the Administrator\" (NRS 612.740), which is stated on DETR's employer pages, and those pages refused automated access (403). So the report date is assumed to be the same as the payment date but was not read. us-states.ts already carries Nevada's Modified Business Tax return, which is a separate tax return.",
   "roll": false
  },
  {
   "id": "us_x_nv_unclaimed",
   "name": "Nevada unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Nevada State Treasurer, Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned reports it to the State Treasurer each year, covering the 12 months to July 1.",
   "why": "The business holds unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NV"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "The report must be filed before November 1 of each year and cover the 12 months next preceding July 1 of that year. A report with respect to an insurance company must be filed before May 1 of each year for the immediately preceding calendar year.",
   "weight": 55,
   "source": "us_x_nv_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "penalty": "Interest at 18 percent a year, plus a civil penalty of $200 for each day the report, payment or delivery is withheld, up to $5,000; $1,000 a day up to $25,000 plus 25 percent of the property if willful.",
   "note": "Due-diligence letter: not more than 120 days or less than 60 days before filing, to owners with a usable address whose property is $50 or more (NRS 120A.560). Property is paid or delivered when the report is filed (safe-deposit box contents within 60 days after). Insurance companies report before May 1. The Treasurer's own holder pages were not read.",
   "roll": false
  },
  {
   "id": "us_x_nj_breach",
   "name": "Notify a data breach in New Jersey",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "New Jersey Division of State Police",
   "brief": "A business whose computerized records of New Jersey residents' personal information are breached must tell those residents, and must report the breach to the State Police first.",
   "why": "You hold personal information about New Jersey residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NJ"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay; State Police first"
   },
   "dueText": "Disclosure to a customer in the most expedient time possible and without unreasonable delay. In advance of the disclosure to the customer, report the breach to the Division of State Police. Over 1,000 persons: also notify the consumer reporting agencies without unreasonable delay.",
   "weight": 50,
   "source": "us_x_nj_breach_src",
   "verified": true,
   "note": "No fixed number of days. Read on the 2019 amending act (official Legislature text), not a consolidated statute.",
   "roll": false
  },
  {
   "id": "us_x_nm_breach",
   "name": "Notify a data breach in New Mexico",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "New Mexico Attorney General",
   "brief": "A business must notify New Mexico residents whose personal identifying information was breached within 45 days, and tell the Attorney General when more than 1,000 residents are notified.",
   "why": "You hold personal information about New Mexico residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NM"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 45 calendar days after discovery of the breach"
   },
   "dueText": "In the most expedient time possible, but not later than forty-five calendar days following discovery of the security breach. More than 1,000 residents: notify the Attorney General and the major consumer reporting agencies within the same 45 calendar days.",
   "weight": 50,
   "source": "us_x_nm_breach_src",
   "verified": true,
   "note": "Read on the enacted 2017 bill text on nmlegis.gov; the codified NMSA chapter 57 article 12C on nmonesource.com did not load (script-only page).",
   "roll": false
  },
  {
   "id": "us_x_ny_breach",
   "name": "Notify a data breach in New York",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "New York Attorney General, Department of State and Division of State Police",
   "brief": "A business whose computerized private information about New York residents is breached must notify them within 30 days, and notify the Attorney General, the Department of State and the State Police (and DFS if it is a covered entity).",
   "why": "You hold personal information about New York residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after the breach has been discovered"
   },
   "dueText": "In the most expedient time possible and without unreasonable delay, provided that such notification shall be made within thirty days after the breach has been discovered. When any New York residents are notified, also notify the state attorney general, the department of state and the division of state police.",
   "weight": 50,
   "source": "us_x_ny_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_nc_breach",
   "name": "Notify a data breach in North Carolina",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "North Carolina Attorney General, Consumer Protection Division",
   "brief": "A business that owns or licenses personal information of North Carolina residents, in any form, must notify affected people of a breach and also notify the Attorney General's Consumer Protection Division.",
   "why": "You hold personal information about North Carolina residents.",
   "applies": {
    "all": [
     {
      "state": [
       "NC"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovery of the breach"
   },
   "dueText": "The disclosure notification shall be made without unreasonable delay. When notice is given to affected persons, notify the Consumer Protection Division of the Attorney General's Office without unreasonable delay; over 1,000 persons, also the nationwide consumer reporting agencies.",
   "weight": 50,
   "source": "us_x_nc_breach_src",
   "verified": true,
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_nd_breach",
   "name": "Notify a data breach in North Dakota",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "North Dakota Attorney General",
   "brief": "A business must tell North Dakota residents whose unencrypted personal information was acquired in a breach, and tell the Attorney General when more than 250 people are affected.",
   "why": "You hold personal information about North Dakota residents.",
   "applies": {
    "all": [
     {
      "state": [
       "ND"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay"
   },
   "dueText": "The disclosure must be made in the most expedient time possible and without unreasonable delay. Disclose to the attorney general, by mail or email, any breach exceeding two hundred fifty individuals.",
   "weight": 50,
   "source": "us_x_nd_breach_src",
   "verified": true,
   "note": "No fixed number of days.",
   "roll": false
  },
  {
   "id": "us_x_oh_breach",
   "name": "Notify a data breach in Ohio",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Ohio Attorney General",
   "brief": "A business must notify Ohio residents whose computerized personal information was breached within 45 days. Over 1,000 residents, it also notifies the consumer reporting agencies.",
   "why": "You hold personal information about Ohio residents.",
   "applies": {
    "all": [
     {
      "state": [
       "OH"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 45 days after discovery or notification of the breach"
   },
   "dueText": "In the most expedient time possible but not later than forty-five days following its discovery or notification of the breach. More than 1,000 residents: notify all nationwide consumer reporting agencies without unreasonable delay.",
   "weight": 50,
   "source": "us_x_oh_breach_src",
   "verified": true,
   "note": "The statute section read does not require notice to the Attorney General.",
   "roll": false
  },
  {
   "id": "us_x_ok_breach",
   "name": "Notify a data breach in Oklahoma",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Oklahoma Attorney General",
   "brief": "A business must notify Oklahoma residents of a breach without unreasonable delay. Since January 1, 2026 it must also tell the Attorney General, within 60 days of notifying residents, when 500 or more residents are affected.",
   "why": "You hold personal information about Oklahoma residents.",
   "applies": {
    "all": [
     {
      "state": [
       "OK"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Residents without unreasonable delay; Attorney General no more than 60 days after notifying residents"
   },
   "dueText": "Disclosure shall be made without unreasonable delay. Notice to the Attorney General without unreasonable delay but in no event more than sixty (60) days after providing notice to impacted residents. Breaches affecting fewer than 500 residents (1,000 for a credit bureau) are exempt from the Attorney General notice.",
   "weight": 50,
   "source": "us_x_ok_breach_src",
   "verified": true,
   "form": "Data Security Breach Reporting Form (Attorney General)",
   "roll": false
  },
  {
   "id": "us_x_or_breach",
   "name": "Notify a data breach in Oregon",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Oregon Department of Justice (Attorney General)",
   "brief": "A business must notify affected consumers within 45 days of discovering a breach, and the Attorney General when more than 250 consumers are notified. A vendor must tell its client within 10 days.",
   "why": "You hold personal information about Oregon residents.",
   "applies": {
    "all": [
     {
      "state": [
       "OR"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 45 days after discovering or being notified of the breach"
   },
   "dueText": "In the most expeditious manner possible, without unreasonable delay, but not later than 45 days after discovering or receiving notification of the breach of security. Notify the Attorney General if more than 250 consumers must be notified.",
   "weight": 50,
   "source": "us_x_or_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_pa_breach",
   "name": "Notify a data breach in Pennsylvania",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Pennsylvania Office of Attorney General",
   "brief": "A business must notify affected Pennsylvania residents without unreasonable delay, and when more than 500 residents are affected, notify the Attorney General at the same time.",
   "why": "You hold personal information about Pennsylvania residents.",
   "applies": {
    "all": [
     {
      "state": [
       "PA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay; Attorney General at the same time when more than 500 residents are affected"
   },
   "dueText": "Notify the affected Pennsylvania resident without unreasonable delay. When more than 500 Pennsylvania residents are affected, notice must be made to the Attorney General at the same time the entity notifies the affected individuals; also notify consumer reporting agencies without unreasonable delay.",
   "weight": 50,
   "source": "us_x_pa_breach_src",
   "verified": true,
   "form": "Attorney General data breach report",
   "note": "The 7-business-day deadlines on the same page apply to state agencies and state contractors, not to ordinary businesses.",
   "roll": false
  },
  {
   "id": "us_x_ri_breach",
   "name": "Notify a data breach in Rhode Island",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Rhode Island Attorney General",
   "brief": "A business must notify affected Rhode Island residents within 45 calendar days of confirming a breach, and the Attorney General and credit reporting agencies when more than 500 residents are notified.",
   "why": "You hold personal information about Rhode Island residents.",
   "applies": {
    "all": [
     {
      "state": [
       "RI"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "No later than 45 calendar days after confirmation of the breach"
   },
   "dueText": "In the most expedient time possible, no later than forty-five (45) calendar days after confirmation of the breach and the ability to ascertain the information required for the notice. More than 500 residents: also notify the attorney general and the major credit reporting agencies.",
   "weight": 50,
   "source": "us_x_ri_breach_src",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_nj_newhire",
   "name": "Report new hires to New Jersey",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "New Jersey Child Support Employer Services Portal (NJ Division of Family Development)",
   "brief": "Every employer reports each new, re-hired or returning employee to New Jersey's new-hire directory, which uses it to collect child support.",
   "why": "You hire employees in New Jersey.",
   "applies": {
    "all": [
     {
      "state": [
       "NJ"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days after the employee is hired, re-hired or returns to work"
   },
   "dueText": "Within 20 days after the employee is hired or re-hired or returns to work. Electronic filers send two monthly transmissions, 12 to 16 days apart.",
   "weight": 60,
   "source": "us_x_nj_newhire_src",
   "verified": true,
   "form": "New hire report (W-4 or state form)",
   "penalty": "Failure to report a new employee could result in a fine up to $25 per violation.",
   "roll": false
  },
  {
   "id": "us_x_nm_newhire",
   "name": "Report new hires to New Mexico",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "New Mexico Health Care Authority",
   "brief": "Employers report every newly hired or re-hired employee, full-time, part-time or temporary, to the New Mexico New Hire Directory.",
   "why": "You hire employees in New Mexico.",
   "applies": {
    "all": [
     {
      "state": [
       "NM"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire date"
   },
   "dueText": "Newly hired and/or rehired employees must be reported within 20 days of their hire date, whether full-time, part-time or temporary.",
   "weight": 60,
   "source": "us_x_nm_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "Neither page read states a penalty amount.",
   "roll": false
  },
  {
   "id": "us_x_ny_newhire",
   "name": "Report new hires to New York",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "New York State Department of Taxation and Finance",
   "brief": "Employers report newly hired or rehired employees who will work in New York, and independent contractors with contracts over $2,500, to the Department of Taxation and Finance.",
   "why": "You hire employees in New York.",
   "applies": {
    "all": [
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days of the hiring date"
   },
   "dueText": "Within 20 calendar days from the hiring date. For a nonresident visa employee, 20 calendar days from the date the employee receives a Social Security number.",
   "weight": 60,
   "source": "us_x_ny_newhire_src",
   "verified": true,
   "form": "Form IT-2104 or online report",
   "penalty": "$20 for each employee not reported on time, and $20 for each false or incomplete report.",
   "roll": false
  },
  {
   "id": "us_x_nc_newhire",
   "name": "Report new hires to North Carolina",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "North Carolina Department of Health and Human Services (State Directory of New Hires)",
   "brief": "Every employer reports the hiring of each employee who fills in a federal W-4 to the North Carolina State Directory of New Hires.",
   "why": "You hire employees in North Carolina.",
   "applies": {
    "all": [
     {
      "state": [
       "NC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 20 days from the date of hire"
   },
   "dueText": "Not later than 20 days from the date of hire, or, for electronic filers, by two monthly transmissions not less than 12 nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_nc_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "A civil penalty of up to $25; up to $500 if the failure results from a conspiracy between employer and employee.",
   "roll": false
  },
  {
   "id": "us_x_nd_newhire",
   "name": "Report new hires to North Dakota",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "North Dakota Health and Human Services, Child Support",
   "brief": "Employers report all newly hired employees, full-time, part-time and temporary, adult and minor, to the North Dakota State Directory of New Hires.",
   "why": "You hire employees in North Dakota.",
   "applies": {
    "all": [
     {
      "state": [
       "ND"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's first day of work"
   },
   "dueText": "Within 20 days of the employee's first day of work.",
   "weight": 60,
   "source": "us_x_nd_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "Civil money penalties set by NDCC § 34-15-05 and § 34-15-06 (amount not stated on the page).",
   "roll": false
  },
  {
   "id": "us_x_oh_newhire",
   "name": "Report new hires to Ohio",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Ohio Department of Job and Family Services",
   "brief": "Every employer reports each newly hired employee, and each contractor it engages, who lives or works in Ohio to the Department of Job and Family Services.",
   "why": "You hire employees in Ohio.",
   "applies": {
    "all": [
     {
      "state": [
       "OH"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 20 days after the date of hire"
   },
   "dueText": "Not later than twenty days after the date on which the employer hires an employee or engages or re-engages a contractor.",
   "weight": 60,
   "source": "us_x_oh_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "$25 for each failure to make a report; $500 for each failure that results from a conspiracy between employer and employee.",
   "note": "Read on the Ohio Revised Code; the state reporting site oh-newhire.com refused automated access (403).",
   "roll": false
  },
  {
   "id": "us_x_ok_newhire",
   "name": "Report new hires to Oklahoma",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Oklahoma Employment Security Commission",
   "brief": "All newly hired employees are reported to the Oklahoma Employment Security Commission.",
   "why": "You hire employees in Oklahoma.",
   "applies": {
    "all": [
     {
      "state": [
       "OK"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's start date"
   },
   "dueText": "All newly hired employees must be reported to OESC within 20 days of a new employee's start date.",
   "weight": 60,
   "source": "us_x_ok_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "The page does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_or_newhire",
   "name": "Report new hires to Oregon",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Oregon Department of Justice, Child Support Program",
   "brief": "Employers report all new hires and rehires, and newly engaged or re-engaged independent contractors, to the Oregon Child Support Program.",
   "why": "You hire employees in Oregon.",
   "applies": {
    "all": [
     {
      "state": [
       "OR"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the hire date"
   },
   "dueText": "Report all new hires and rehires within 20 days of the hire date; newly engaged and reengaged independent contractors within the same timeframe.",
   "weight": 60,
   "source": "us_x_or_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "The page does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_pa_newhire",
   "name": "Report new hires to Pennsylvania",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Pennsylvania Department of Labor & Industry (PA CareerLink)",
   "brief": "All employers with employees in Pennsylvania report each new hire, and rehires after more than 30 days without pay, to the Pennsylvania New Hire Reporting Program.",
   "why": "You hire employees in Pennsylvania.",
   "applies": {
    "all": [
     {
      "state": [
       "PA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the date of hire (the first day services are performed for wages)"
   },
   "dueText": "Employers must report their new hires to the Program within twenty (20) days of the Date of Hire, the first day services are performed for wages.",
   "weight": 60,
   "source": "us_x_pa_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "The page does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_ri_newhire",
   "name": "Report new hires to Rhode Island",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Rhode Island New Hire Reporting Directory (Office of Child Support Services)",
   "brief": "Employers report all new hires and rehires to the Rhode Island New Hire Registry. Rhode Island's deadline is shorter than most states'.",
   "why": "You hire employees in Rhode Island.",
   "applies": {
    "all": [
     {
      "state": [
       "RI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days of employment"
   },
   "dueText": "Report all new hires or rehires within 14 days of employment; electronic filers by two monthly transmissions not less than 12 or more than 16 days apart.",
   "weight": 60,
   "source": "us_x_ri_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "The page does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_nj_retire",
   "name": "Register for RetireReady NJ (or certify an exemption)",
   "dept": "labour",
   "head": "State retirement programme",
   "authority": "New Jersey Department of the Treasury, RetireReady NJ",
   "brief": "New Jersey employers with ten or more employees that do not offer a qualified retirement plan must facilitate the state's RetireReady NJ savings programme: register, add employees and send payroll deductions. Employers with their own plan certify an exemption.",
   "why": "You employ ten or more people in New Jersey and may not offer a retirement plan.",
   "applies": {
    "all": [
     {
      "state": [
       "NJ"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "December 1, 2026 for employers with 20 to 24 employees; February 17, 2027 for 10 to 19; deadlines for 25 or more have passed"
   },
   "dueText": "December 1, 2026: employers with 20 to 24 employees. February 17, 2027: employers with 10 to 19 employees. Employers with 25 to 39 and 40 or more employees: deadlines have passed.",
   "weight": 45,
   "source": "us_x_nj_retire_src",
   "verified": true,
   "form": "RetireReady NJ employer registration",
   "note": "Applies only to employers with 10 or more New Jersey employees and no qualified plan; there is no shared question for that, so the checker should treat this as conditional. The page read does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_nj_uiwage",
   "name": "New Jersey quarterly wage report (WR-30) and contribution report (NJ-927)",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "New Jersey Department of Labor and Workforce Development, Division of Employer Accounts",
   "brief": "Every quarter, employers file Form WR-30 listing each employee's wages and base weeks, and Form NJ-927 with the contributions due, both electronically.",
   "why": "You pay employees in New Jersey.",
   "applies": {
    "all": [
     {
      "state": [
       "NJ"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "days": 30
   },
   "dueText": "File the Employer Report of Wages Paid (WR-30) within 30 days of the end of each calendar quarter. Employers with only household workers file once a year, by January 30.",
   "weight": 80,
   "source": "us_x_nj_uiwage_src",
   "verified": true,
   "form": "WR-30 and NJ-927",
   "penalty": "For each employee not reported, reported late or incompletely: $5 for the first failure in eight consecutive quarters, $10 for the second, $25 for the third or later.",
   "note": "The NJ-927 also carries the employer and worker contributions for New Jersey temporary disability and family leave insurance. The handbook page read states the WR-30 deadline; the NJ-927 date was not separately stated on it.",
   "roll": false
  },
  {
   "id": "us_x_nm_uiwage",
   "name": "New Mexico quarterly wage and contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "New Mexico Department of Workforce Solutions",
   "brief": "Employers file a wage and contribution report online every quarter, even when no wages were paid, and pay the unemployment contributions due.",
   "why": "You pay employees in New Mexico.",
   "applies": {
    "all": [
     {
      "state": [
       "NM"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "On or before the last day of the month immediately following the end of the calendar quarter; if that is a Saturday, Sunday or legal holiday, the next department business day.",
   "weight": 80,
   "source": "us_x_nm_uiwage_src",
   "verified": true,
   "form": "Employer's Quarterly Wage and Contribution Report",
   "penalty": "$50 if the report is not filed within 10 days after the due date; an additional 5% (at least $25) on contributions not paid in full within 10 days after the due date.",
   "roll": false
  },
  {
   "id": "us_x_ny_uiwage",
   "name": "New York quarterly combined withholding, wage reporting and unemployment insurance return",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "New York State Department of Labor",
   "brief": "Every covered employer files Form NYS-45 each quarter, even with no payroll, reporting wages, unemployment insurance contributions and New York income tax withheld.",
   "why": "You pay employees in New York.",
   "applies": {
    "all": [
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "April 30, July 31, October 31 and January 31 for the quarters ending March 31, June 30, September 30 and December 31. You may file on the next business day when the due date falls on a Saturday, Sunday or legal holiday.",
   "weight": 80,
   "source": "us_x_ny_uiwage_src",
   "verified": true,
   "form": "NYS-45",
   "penalty": "Penalties and interest apply; interest on overdue unemployment insurance contributions is 12% a year, and contributions paid more than 60 days late are not credited for rate purposes.",
   "note": "The NYS-45 also carries New York withholding tax, which us-states.ts may already cover under withholding; this item is the unemployment-insurance wage report side.",
   "roll": false
  },
  {
   "id": "us_x_nc_uiwage",
   "name": "North Carolina quarterly tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "North Carolina Division of Employment Security",
   "brief": "Employers file a quarterly unemployment tax and wage report with the Division of Employment Security and pay the tax due.",
   "why": "You pay employees in North Carolina.",
   "applies": {
    "all": [
     {
      "state": [
       "NC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly Tax and Wage Reports are due by the last day of the month following the end of each quarter. If the due date falls on a weekend or a holiday, the due date will be the first working day after.",
   "weight": 80,
   "source": "us_x_nc_uiwage_src",
   "verified": true,
   "form": "NCUI 101 (Employer's Quarterly Tax and Wage Report)",
   "penalty": "Late filing: 5% of the tax due per month, up to 25%. Late payment: 10% of the tax due. Interest also applies.",
   "roll": false
  },
  {
   "id": "us_x_nd_uiwage",
   "name": "North Dakota quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Job Service North Dakota",
   "brief": "Employers file a contribution and wage report every quarter and pay the unemployment tax due. Employers reporting more than 24 employees must file electronically.",
   "why": "You pay employees in North Dakota.",
   "applies": {
    "all": [
     {
      "state": [
       "ND"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "By the end of the month following the quarter: April 30, July 31, October 31 and January 31. If the due date falls on a weekend or a holiday, it moves to the next business day.",
   "weight": 80,
   "source": "us_x_nd_uiwage_src",
   "verified": true,
   "form": "Contribution and Wage Report (UI EASY)",
   "penalty": "5% of contributions due for each month or part of a month until filed; at least $25 for the first late report in a calendar year and $100 for later ones; at most $500 per report.",
   "roll": false
  },
  {
   "id": "us_x_oh_uiwage",
   "name": "Ohio quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Ohio Department of Job and Family Services",
   "brief": "Every contributory employer files a quarterly unemployment contribution and wage report electronically, listing each employee's pay.",
   "why": "You pay employees in Ohio.",
   "applies": {
    "all": [
     {
      "state": [
       "OH"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Not later than the last day of the first month following the close of the calendar quarter.",
   "weight": 80,
   "source": "us_x_oh_uiwage_src",
   "verified": true,
   "form": "Quarterly contribution and wage report",
   "penalty": "A forfeiture of 0.25% of total remuneration reported, at least $50 and at most $1,000.",
   "note": "Read on the Ohio Revised Code and Administrative Code; jfs.ohio.gov pages returned 404.",
   "roll": false
  },
  {
   "id": "us_x_ok_uiwage",
   "name": "Oklahoma quarterly contribution and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Oklahoma Employment Security Commission",
   "brief": "Employers report contributions and wages paid through the OESC Employer Portal every quarter, even when no wages were paid.",
   "why": "You pay employees in Oklahoma.",
   "applies": {
    "all": [
     {
      "state": [
       "OK"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "On or before the last day of the month following the calendar quarter to be reported.",
   "weight": 80,
   "source": "us_x_ok_uiwage_src",
   "verified": true,
   "form": "OES-3 (filed through the Employer Portal)",
   "penalty": "If not filed within 15 days of the Notice of Non-Receipt (OES-054): $200 plus 10% of total contributions due for experience-rated employers; interest 1% a month.",
   "roll": false
  },
  {
   "id": "us_x_or_uiwage",
   "name": "Oregon quarterly combined payroll tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Oregon Employment Department and Department of Revenue",
   "brief": "Form OQ reports, each quarter, wages for unemployment insurance, Paid Leave Oregon contributions, and state withholding and transit taxes.",
   "why": "You pay employees in Oregon.",
   "applies": {
    "all": [
     {
      "state": [
       "OR"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "2026: April 30, July 31, November 2, 2026 and February 1, 2027. If the due date is on a weekend or holiday, the report is due the next business day.",
   "weight": 80,
   "source": "us_x_or_uiwage_src",
   "verified": true,
   "form": "Form OQ",
   "penalty": "UI late filing (more than 10 days late after a warning or penalty in the past 3 years): $11 per employee reported, minimum $100, maximum $2,800. Paid Leave late filing: 2% of employee wages. DOR: 5% late payment, plus 20% if more than a month late.",
   "note": "The same Form OQ is the Paid Leave Oregon quarterly report, so no separate pfml item is listed for Oregon.",
   "roll": false
  },
  {
   "id": "us_x_pa_uiwage",
   "name": "Pennsylvania quarterly unemployment compensation wage and tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Pennsylvania Department of Labor & Industry",
   "brief": "Employers file quarterly wage and tax reports electronically in the Unemployment Compensation Management System and pay employer and employee contributions.",
   "why": "You pay employees in Pennsylvania.",
   "applies": {
    "all": [
     {
      "state": [
       "PA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Reports and contributions are due at the end of the month following the calendar quarter (April 30, July 31, October 31 and January 31). If a due date falls on a weekend or legal holiday, the report is due the next business day.",
   "weight": 80,
   "source": "us_x_pa_uiwage_src",
   "verified": true,
   "form": "UC-2 / UC-2A (filed in UCMS)",
   "penalty": "15% of the total contributions payable for the quarter, minimum $125, maximum $450. Interest accrues on unpaid contributions.",
   "roll": false
  },
  {
   "id": "us_x_ri_uiwage",
   "name": "Rhode Island quarterly tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Rhode Island Department of Labor and Training",
   "brief": "Employers file the TX-17 each quarter for employment security, job development fund and temporary disability insurance taxes, with each employee's wages.",
   "why": "You pay employees in Rhode Island.",
   "applies": {
    "all": [
     {
      "state": [
       "RI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Last business day of April, July, October and January.",
   "weight": 80,
   "source": "us_x_ri_uiwage_src",
   "verified": true,
   "form": "TX-17",
   "penalty": "$25 for failure to file the quarterly tax report and 10% for failure to pay contributions to each fund, with interest at 1.5% a month; $25 for late wage information plus $25 a month, up to $200 per report.",
   "note": "Due date read on the Department of State's business-tax page (revised 03/2026); the DLT Employer Tax Unit pages refused automated access (403). The 'last business day' wording can be earlier than the month-end. The TX-17 also carries Rhode Island TDI contributions.",
   "roll": false
  },
  {
   "id": "us_x_nj_unclaimed",
   "name": "New Jersey unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "New Jersey Department of the Treasury, Unclaimed Property Administration",
   "brief": "A business holding money or property owed to someone it cannot reach after the dormancy period reports it and pays it over to the State Treasurer each year. Before filing, it must write to owners of items of $50 or more.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NJ"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Reports of personal property must be postmarked before November 1, covering July 1 to June 30. Life insurance property: before May 1, covering the calendar year. Due-diligence letter (certified mail, items of $50 or more): not more than 120 and not less than 60 days before the report.",
   "weight": 55,
   "source": "us_x_nj_unclaimed_src",
   "verified": true,
   "form": "Unclaimed Personal Property Report",
   "penalty": "Interest plus a civil penalty of $200 for each day the report, payment or delivery is withheld, up to $100,000.",
   "note": "Due set to October 31 because the report must be postmarked BEFORE November 1. Life insurers: before May 1.",
   "roll": false
  },
  {
   "id": "us_x_nm_unclaimed",
   "name": "New Mexico unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "New Mexico Taxation and Revenue Department",
   "brief": "Businesses holding unclaimed money or property report and remit it to the Unclaimed Property Office each year, after sending written notice to the owner.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NM"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "On or before November 1 of each year for the twelve months next preceding July 1; life insurance companies on or before May 1 for the preceding calendar year. Written notice to the owner not more than 120 days before filing.",
   "weight": 55,
   "source": "us_x_nm_unclaimed_src",
   "verified": true,
   "form": "Holder report (negative report RPD-41205 if nothing to report)",
   "penalty": "Interest, plus a civil penalty of $100 a day, up to $5,000; higher penalties for wilful failure or fraud.",
   "roll": false
  },
  {
   "id": "us_x_ny_unclaimed",
   "name": "New York unclaimed funds report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Office of the New York State Comptroller, Office of Unclaimed Funds",
   "brief": "Businesses report and remit funds that became dormant by December 31 to the State Comptroller, after mailing owners first-class and, for larger amounts, by certified mail.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_x_unclaimed",
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
      10
     ]
    ]
   },
   "dueText": "Final report, Verification and Checklist and remittance received by close of business March 10. First-class mailing completed by December 10; certified mailing completed by January 10; dormancy cut-off December 31.",
   "weight": 55,
   "source": "us_x_ny_unclaimed_src",
   "verified": true,
   "form": "Final report with Verification and Checklist (AC2709)",
   "penalty": "$100 for each day a report or affidavit is wilfully delayed or withheld (APL section 1412).",
   "note": "Dates are for general business entities; banks, insurers, brokers and other industries have their own reference sheets.",
   "roll": false
  },
  {
   "id": "us_x_nc_unclaimed",
   "name": "North Carolina unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "North Carolina Department of State Treasurer (NCCash)",
   "brief": "Businesses report and remit unclaimed property to the State Treasurer each year, after mailing owners a notice within a set window before the due date.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "NC"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "By November 1 each year for the prior fiscal year (July 1 to June 30); life insurance companies by May 1 for the prior calendar year. Notices mailed not more than 120 or less than 60 days from the reporting due date.",
   "weight": 55,
   "source": "us_x_nc_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "penalty": "Daily interest, a $1,000 civil penalty for each day the report is held, plus 25% of the value of property that should be reported (G.S. 116B-77).",
   "note": "G.S. 116B-60(d) says 'before November 1'. The notice threshold is $50 ($25 for securities) until December 1, 2026, then $25 for all property.",
   "roll": false
  },
  {
   "id": "us_x_nd_unclaimed",
   "name": "North Dakota unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "North Dakota Department of Trust Lands, Unclaimed Property Division",
   "brief": "Businesses holding property presumed abandoned report it to the state each year, after sending the owner a first-class notice for items of $25 or more.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "ND"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Before November first of each year, covering the twelve months preceding July first; life insurance companies before May first for the preceding calendar year. Owner notice not more than 120 days before filing.",
   "weight": 55,
   "source": "us_x_nd_unclaimed_src",
   "verified": true,
   "form": "Holder report (electronic, NAUPA format)",
   "penalty": "Interest at 1% per 30 days, and a civil penalty of $200 a day, up to $5,000; up to $1,000 a day (max $25,000) plus 25% of the value for evasion.",
   "note": "Read on the statute; the Unclaimed Property Division site is a script-only app that returned no readable text. Due set to October 31 because the law says 'before November first'.",
   "roll": false
  },
  {
   "id": "us_x_oh_unclaimed",
   "name": "Ohio unclaimed funds report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Ohio Department of Commerce, Division of Unclaimed Funds",
   "brief": "Holders of unclaimed funds report them to the Division of Unclaimed Funds each year. Before filing, they mail each owner of an item of $50 or more (certified mail for $1,000 or more).",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "OH"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Before the first day of November of each year as of the preceding June 30; holders providing life insurance coverage before the first day of May as of the preceding December 31. The owner notice states the funds will be reported thirty days after mailing.",
   "weight": 55,
   "source": "us_x_oh_unclaimed_src",
   "verified": true,
   "form": "Unclaimed funds report (filed online)",
   "note": "The penalty section was not read. The Department of Commerce news page returned 404.",
   "roll": false
  },
  {
   "id": "us_x_ok_unclaimed",
   "name": "Oklahoma unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Oklahoma State Treasurer",
   "brief": "Every business entity reports unclaimed property to the State Treasurer each year, after sending owners of items of $50 or more a written notice.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "OK"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "All business entities, except life insurance companies, must report annually prior to November 1; life insurance companies prior to May 1. Due diligence notice not more than 120 days before filing, for each property of $50 or more.",
   "weight": 55,
   "source": "us_x_ok_unclaimed_src",
   "verified": true,
   "form": "Report of Unclaimed Property (497-UP-2) with notarized Verification of Report",
   "note": "The page read does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_or_unclaimed",
   "name": "Oregon unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Oregon State Treasury, Unclaimed Property Program",
   "brief": "Holders report property presumed abandoned to the State Treasurer each year, after trying to reach the owner at least 60 days before filing.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "OR"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "After October 1, but no later than November 1, of each year for accounts dormant as of June 30. Due diligence to find the owner at least 60 days before filing.",
   "weight": 55,
   "source": "us_x_or_unclaimed_src",
   "verified": true,
   "form": "Holder report (NAUPA format)",
   "penalty": "For wilful failure, up to $1,000 for individuals and $50,000 for corporations (ORS 98.992), after at least one reporting cycle and written instructions.",
   "note": "Read on the statute; unclaimed.oregon.gov is a script-only app that returned no readable text.",
   "roll": false
  },
  {
   "id": "us_x_pa_unclaimed",
   "name": "Pennsylvania unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Pennsylvania Treasury",
   "brief": "Holders report and remit unclaimed property to the Pennsylvania Treasury every spring, after sending owners of property of $50 or more a notice.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "PA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      4,
      15
     ]
    ]
   },
   "dueText": "Reports, property and remittance are due by April 15; Treasury accepts reports from January 1. Owner notice not more than 120 days nor less than 60 days before the due date.",
   "weight": 55,
   "source": "us_x_pa_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "penalty": "Interest at 12% a year, and penalties if warranted under Section 1301.24.",
   "roll": false
  },
  {
   "id": "us_x_ri_unclaimed",
   "name": "Rhode Island unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Rhode Island Office of the General Treasurer",
   "brief": "Holders of property presumed abandoned report it to the General Treasurer each year, after writing to owners of property of $50 or more.",
   "why": "You hold unclaimed money or property belonging to others.",
   "applies": {
    "all": [
     {
      "state": [
       "RI"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Before November 1 of each year as of June 30 next preceding (life insurance companies on the same date). Owner notice not more than 120 days before filing.",
   "weight": 55,
   "source": "us_x_ri_unclaimed_src",
   "verified": true,
   "form": "Holder report",
   "note": "The Treasury's own pages refused automated access (403). Penalty section not read.",
   "roll": false
  },
  {
   "id": "us_x_sc_newhire",
   "name": "Report new hires to South Carolina",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "South Carolina Department of Social Services (State Directory of New Hires)",
   "brief": "An employer who hires, or rehires after at least 60 days away, an employee who lives or works in South Carolina reports the hire to the state directory of new hires. The report can be the W-4 form or an equivalent.",
   "why": "You have employees in South Carolina.",
   "applies": {
    "all": [
     {
      "state": [
       "SC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days of hiring each employee"
   },
   "dueText": "Within twenty calendar days of the hiring of the employee. Employers who report electronically send reports twice a month, not less than 12 nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_sc_newhire_src",
   "verified": true,
   "form": "W-4 or an equivalent form",
   "penalty": "A civil penalty of no more than $25 for the second offense and every offense after it (unless the employer shows good cause), or no more than $500 for each offense if the failure results from a conspiracy between the employer and the employee.",
   "note": "The state's reporting site newhire.sc.gov is a script-only application and could not be read; the deadline and penalty were read in the statute.",
   "roll": false
  },
  {
   "id": "us_x_sc_uiwage",
   "name": "South Carolina quarterly unemployment wage report and contributions",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "South Carolina Department of Employment and Workforce",
   "brief": "Covered employers file a wage report and pay unemployment insurance tax every quarter through the SUITS system. A report is due every quarter, even with no payroll.",
   "why": "You have employees in South Carolina.",
   "applies": {
    "all": [
     {
      "state": [
       "SC"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "By the last day of the month following the last month of the quarter: April 30, July 31, October 31 and January 31.",
   "weight": 80,
   "source": "us_x_sc_uiwage_src",
   "verified": true,
   "form": "Quarterly wage report (SUITS)",
   "penalty": "A late filing penalty of ten percent of the contributions due for each report not filed on time; a one percent interest charge on unpaid contributions is assessed monthly; $25 for a returned payment.",
   "roll": false
  },
  {
   "id": "us_x_sc_unclaimed",
   "name": "South Carolina unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "South Carolina Office of the State Treasurer, Unclaimed Property Program",
   "brief": "Anyone holding property that belongs to someone else and has gone unclaimed (uncashed cheques, credits, deposits, unpaid wages) reports it to the State Treasurer every year, for property as of June 30. There is no minimum amount, and the Treasurer's FAQ says a 'negative' report is filed when there is nothing to report.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "SC"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Before November 1 each year, as of the preceding June 30. Not more than 120 days before filing, the holder sends written notice to each apparent owner whose property is worth $50 or more.",
   "weight": 55,
   "source": "us_x_sc_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (filed online)",
   "penalty": "A civil penalty of $100 for each day the report is withheld, up to $5,000; a civil penalty of 25% of the value of property not paid or delivered; interest on property paid late.",
   "note": "An extension may be requested before November 1 by email to the Treasurer's office.",
   "roll": false
  },
  {
   "id": "us_x_sc_breach",
   "name": "South Carolina data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "South Carolina Department of Consumer Affairs",
   "brief": "A business that owns or licenses data with personal identifying information of South Carolina residents tells the affected residents when a breach makes illegal use likely or creates a material risk of harm. If more than 1,000 people are notified at one time, it also tells the Consumer Protection Division of the Department of Consumer Affairs and the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about South Carolina residents.",
   "applies": {
    "all": [
     {
      "state": [
       "SC"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible and without unreasonable delay after discovering the breach"
   },
   "dueText": "The law sets no number of days: the disclosure must be made in the most expedient time possible and without unreasonable delay. Notice to the Department of Consumer Affairs (more than 1,000 people notified) is also without unreasonable delay.",
   "weight": 50,
   "source": "us_x_sc_breach_src",
   "verified": true,
   "penalty": "An administrative fine of $1,000 for each resident whose information was accessible, for a knowing and wilful violation; injured residents may also sue.",
   "roll": false
  },
  {
   "id": "us_x_sd_newhire",
   "name": "Report new hires to South Dakota",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "South Dakota Department of Labor and Regulation, New Hire Reporting Center",
   "brief": "Employers report every newly hired employee, and every rehired employee who has not been paid for the past 30 days, to the New Hire Reporting Center.",
   "why": "You have employees in South Dakota.",
   "applies": {
    "all": [
     {
      "state": [
       "SD"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's first day of work"
   },
   "dueText": "Newly hired or rehired employees (not paid for the past 30 days) must be reported within 20 days of the first day of work. A rehired employee is reported with the most recent date of hire.",
   "weight": 60,
   "source": "us_x_sd_newhire_src",
   "verified": true,
   "form": "New hire report (W-4 or online)",
   "penalty": "Intentionally failing to comply is a petty offense with a penalty of $25 for each violation, and up to $500 per newly hired employee if the employer and employee conspire not to report.",
   "roll": false
  },
  {
   "id": "us_x_sd_uiwage",
   "name": "South Dakota quarterly reemployment assistance wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "South Dakota Department of Labor and Regulation, Reemployment Assistance Division",
   "brief": "South Dakota calls unemployment insurance 'reemployment assistance'. Employers file a quarterly wage report and pay the contributions due, online through the Internet Quarterly Wage Reporting System, even for a quarter with no wages.",
   "why": "You have employees in South Dakota.",
   "applies": {
    "all": [
     {
      "state": [
       "SD"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly: January-March due April 30, April-June due July 31, July-September due October 31, October-December due January 31. A report is still due when no wages were paid. With prior approval, domestic employers may report annually.",
   "weight": 80,
   "source": "us_x_sd_uiwage_src",
   "verified": true,
   "form": "Employer's Reemployment Assistance Quarterly Report (Form 21)",
   "penalty": "$25 per month or part of a month for late filing and another $25 per month for late payment, at most $150 for any one report or contribution; interest of 1.5% per month on the tax due.",
   "roll": false
  },
  {
   "id": "us_x_sd_unclaimed",
   "name": "South Dakota unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "South Dakota State Treasurer, Unclaimed Property Division",
   "brief": "A business holding property presumed abandoned (uncashed cheques, credits, unpaid wages and the like) reports it to the State Treasurer each year, for property as of June 30. Before filing, it tries to reach each owner and mails a notice for property worth $50 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "SD"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Before November 1 each year, as of the preceding June 30 (life insurance companies: before May 1, as of December 31). The Treasurer may postpone the date on written request.",
   "weight": 55,
   "source": "us_x_sd_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest at the Category A rate on property not paid or delivered on time, from the date it should have been paid or delivered.",
   "note": "The Treasurer's unclaimed property page (sdtreasurer.gov/unclaimed-property/) carries no holder deadline in its readable text; the date was read in the statute. No due-diligence day window is set: the statute says the notice is mailed before the annual report is filed.",
   "roll": false
  },
  {
   "id": "us_x_sd_breach",
   "name": "South Dakota data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "South Dakota Attorney General",
   "brief": "A business that holds personal or protected information and has a breach tells each affected South Dakota resident. If more than 250 residents are affected it also tells the Attorney General by mail or email.",
   "why": "The business holds personal information about South Dakota residents.",
   "applies": {
    "all": [
     {
      "state": [
       "SD"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 days of discovering or being told of the breach"
   },
   "dueText": "Not later than sixty days from the discovery or notification of the breach, unless law enforcement needs more time. Breaches of more than 250 residents are also disclosed to the attorney general.",
   "weight": 50,
   "source": "us_x_sd_breach_src",
   "verified": true,
   "penalty": "The Attorney General may prosecute each failure to disclose as a deceptive act or practice and seek a civil penalty of up to $10,000 per day per violation.",
   "roll": false
  },
  {
   "id": "us_x_tn_newhire",
   "name": "Report new hires to Tennessee",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Tennessee Department of Human Services (State Directory of New Hires)",
   "brief": "Employers report every newly hired employee, and every rehired employee who was away for at least 60 consecutive days, to the State Directory of New Hires (online at tnnewhire.com, electronically, or by mail or fax).",
   "why": "You have employees in Tennessee.",
   "applies": {
    "all": [
     {
      "state": [
       "TN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the date each employee is hired"
   },
   "dueText": "Employers must report their newly hired or rehired employees within 20 days of the date they are hired.",
   "weight": 60,
   "source": "us_x_tn_newhire_src",
   "verified": true,
   "form": "Tennessee New Hire Reporting Form or W-4",
   "penalty": "Failure to report a new employee could result in a fine of $20 for each employee who is not reported.",
   "roll": false
  },
  {
   "id": "us_x_tn_uiwage",
   "name": "Tennessee quarterly unemployment wage report and premiums",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Tennessee Department of Labor and Workforce Development",
   "brief": "Employers liable for Tennessee unemployment insurance (for example, $1,500 or more of wages in a calendar quarter, or an employee in 20 different weeks of a year) file a wage report and pay premiums every quarter through Employer e-Services.",
   "why": "You have employees in Tennessee.",
   "applies": {
    "all": [
     {
      "state": [
       "TN"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "event",
    "text": "Each calendar quarter; confirm the due date with the Department of Labor and Workforce Development"
   },
   "dueText": "Not confirmed: the department's page that states the quarterly due date (lwdsupport.tn.gov, 'When are quarterly reports due?') refused automated access. Confirm the date there.",
   "weight": 80,
   "source": "us_x_tn_uiwage_src",
   "verified": false,
   "form": "Quarterly wage and premium report (Employer e-Services)",
   "note": "Who must file was read on tn.gov; the due date and late penalty were not, because lwdsupport.tn.gov returned 403. The department's FAQ PDF only says delinquent quarters can still be filed after an assessment.",
   "roll": false
  },
  {
   "id": "us_x_tn_unclaimed",
   "name": "Tennessee unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Tennessee Department of Treasury, Unclaimed Property Division",
   "brief": "Businesses holding unclaimed property (most property after 3 years of inactivity, payroll after 1 year) report and remit it to the Treasury each year through the online ReportItTN portal. Before reporting, a first-class letter goes to each owner with $50 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "TN"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Report and remit by November 1 each year. Due-diligence letters to owners of $50 or more: wait at least 60 days after mailing before reporting, and no more than 180 days.",
   "weight": 55,
   "source": "us_x_tn_unclaimed_src2",
   "verified": true,
   "form": "Annual holder report (NAUPA format, ReportItTN)",
   "penalty": "Tennessee law provides two types of penalty: for failure to report or perform other duties, and for failure to pay or deliver property. The Treasury's pages do not state the amounts.",
   "note": "For 2026 the Treasury says that because November 1 falls on a Sunday it will accept reports submitted by Monday, November 2, without penalty. The penalty amounts are only in the statute, which the Treasury links on LexisNexis and was not read.",
   "roll": false
  },
  {
   "id": "us_x_tn_breach",
   "name": "Tennessee data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Tennessee Attorney General",
   "brief": "Businesses must notify Tennessee residents whose personal information was, or may have been, acquired by an unauthorized person (Tenn. Code Ann. § 47-18-2107).",
   "why": "The business holds personal information about Tennessee residents.",
   "applies": {
    "all": [
     {
      "state": [
       "TN"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 45 days of the breach, unless law enforcement requires an extension"
   },
   "dueText": "In Tennessee, the organization must provide notice of the data breach within 45 days, unless law enforcement requires an extension for legitimate reasons.",
   "weight": 50,
   "source": "us_x_tn_breach_src",
   "verified": true,
   "note": "The Attorney General's summary does not say from when the 45 days run or state a penalty; the statute itself (on LexisNexis) was not read.",
   "roll": false
  },
  {
   "id": "us_x_tx_newhire",
   "name": "Report new hires to Texas",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Office of the Attorney General of Texas, Child Support Division",
   "brief": "Employers report every newly hired or rehired employee who lives or works in any state (anyone who fills out a W-4) to the Texas new hire registry, online through the Attorney General's employer portal.",
   "why": "You have employees in Texas.",
   "applies": {
    "all": [
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 calendar days from the date the employee starts earning wages"
   },
   "dueText": "Federal and state law requires employers to report new hires and rehires within 20 calendar days from the date the employee starts earning wages.",
   "weight": 60,
   "source": "us_x_tx_newhire_src",
   "verified": true,
   "form": "New hire report (W-4 data, online employer portal)",
   "note": "The Attorney General's page does not state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_tx_uiwage",
   "name": "Texas Employer's Quarterly Report (unemployment tax)",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Texas Workforce Commission",
   "brief": "Liable employers report each employee's gross wages every quarter and pay unemployment tax on the first $9,000 per employee per year. Reports and payments must be made electronically, and a report is due even for a quarter with no wages.",
   "why": "You have employees in Texas.",
   "applies": {
    "all": [
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly wage reports and tax payments are due by the last day of the month following the end of the quarter: April 30, July 31, October 31 and January 31 (the next business day if that falls on a weekend or holiday).",
   "weight": 80,
   "source": "us_x_tx_uiwage_src",
   "verified": true,
   "form": "Employer's Quarterly Report",
   "penalty": "Late report: $15 if filed within 15 days after the due date; after that, 0.05% of taxable wages + $30 (by the end of the following month), 0.15% + $60 (second month) or 0.35% + $90 (third month or later). Late tax: interest of 1.5% a month, up to 37.5%. Not filing and paying electronically may also be penalised.",
   "roll": false
  },
  {
   "id": "us_x_tx_unclaimed",
   "name": "Texas unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Texas Comptroller of Public Accounts, Unclaimed Property Division",
   "brief": "Businesses that on March 1 hold property presumed abandoned file a report and pay it to the Comptroller by July 1, in the NAUPA electronic format. Holders that have filed before, and find nothing to report, file a negative report.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      7,
      1
     ]
    ]
   },
   "dueText": "On or before July 1 each year, for property presumed abandoned as of March 1. Notices to owners of property worth more than $250 must be sent no later than 60 days before the report is submitted.",
   "weight": 55,
   "source": "us_x_tx_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA2 format, ClaimItTexas.gov)",
   "penalty": "Interest and penalty from the date the property should have been paid until it is received; a rejected report not corrected within 30 days may be subject to a daily penalty.",
   "roll": false
  },
  {
   "id": "us_x_tx_breach",
   "name": "Texas data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Office of the Attorney General of Texas, Consumer Protection Division",
   "brief": "A business with a breach of system security must notify the affected consumers. If the breach affects 250 or more Texans it must also report it to the Attorney General, electronically on the OAG's Data Breach Report form.",
   "why": "The business holds personal information about Texas residents.",
   "applies": {
    "all": [
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Attorney General report (250 or more Texans): as soon as practicably possible and no later than 30 days after discovering the breach"
   },
   "dueText": "Report to the Attorney General as soon as practicably possible and no later than 30 days after the discovery of the breach, when 250 or more Texans are affected. Notice to affected consumers is also required.",
   "weight": 50,
   "source": "us_x_tx_breach_src",
   "verified": true,
   "note": "The Attorney General's page gives no day count for notice to consumers and no penalty; the statute (Bus. & Com. Code ch. 521) is on a script-only site that could not be read.",
   "roll": false
  },
  {
   "id": "us_x_ut_newhire",
   "name": "Report new hires to Utah",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Utah Department of Workforce Services, New Hire Registry",
   "brief": "Employers report each newly hired or rehired employee to the Utah New Hire Registry: the employee's name, Social Security number, address and date of hire, and the employer's name, FEIN and address. Online reporting is preferred.",
   "why": "You have employees in Utah.",
   "applies": {
    "all": [
     {
      "state": [
       "UT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's first day of work"
   },
   "dueText": "Every employer is required to report seven mandatory data elements within 20 days of any newly hired/rehired employee's first day of work.",
   "weight": 60,
   "source": "us_x_ut_newhire_src",
   "verified": true,
   "form": "Online new hire report or Form 6",
   "penalty": "A civil penalty of $25 for each failure, or $500 if the failure is intentional and results from an agreement between employer and employee.",
   "roll": false
  },
  {
   "id": "us_x_ut_uiwage",
   "name": "Utah quarterly unemployment wage list and contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Utah Department of Workforce Services, Unemployment Insurance",
   "brief": "Employers file the quarterly wage list and contribution report online and pay unemployment contributions every quarter, including quarters with no wages, until the account is closed.",
   "why": "You have employees in Utah.",
   "applies": {
    "all": [
     {
      "state": [
       "UT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarter ending March 31 due April 30; June 30 due July 31; September 30 due October 31; December 31 due January 31. Domestic employers may choose to file annually by January 31.",
   "weight": 80,
   "source": "us_x_ut_uiwage_src",
   "verified": true,
   "form": "Wage List and Contribution Report",
   "penalty": "Late report: 5% of the contribution due if no more than 15 days late, plus 5% for each further 15 days, up to 25% and never less than $25. Late payment: another 5% of the contribution and interest of 1% a month. Incomplete or wrongly formatted wage information: $50 per 15 days, up to $250 per filing.",
   "roll": false
  },
  {
   "id": "us_x_ut_unclaimed",
   "name": "Utah unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Utah State Treasurer, Unclaimed Property Division",
   "brief": "A holder of property presumed abandoned files a report with the Unclaimed Property Division each year, covering the 12 months before July 1. Between 180 and 60 days before filing, it mails a notice to each owner of property worth $50 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "UT"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Before November 1 of each year, covering the 12 months preceding July 1. Owner notices: not more than 180 days nor less than 60 days before filing. An extension may be requested before the due date.",
   "weight": 55,
   "source": "us_x_ut_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest at the federal short-term rate plus four percentage points, and a civil penalty of $200 for each day the duty is not performed, up to $5,000.",
   "note": "The Treasurer's holder FAQ (mycash.utah.gov/app/faq-report) is a script-only page and could not be read; the rule was read in the statute.",
   "roll": false
  },
  {
   "id": "us_x_ut_breach",
   "name": "Utah data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Utah Attorney General",
   "brief": "A business that owns or licenses computerized personal information of Utah residents investigates any breach promptly. If misuse for identity theft or fraud has occurred or is reasonably likely, it notifies each affected resident; for 500 or more residents also the Attorney General's office and the Utah Cyber Center; for 1,000 or more also the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about Utah residents.",
   "applies": {
    "all": [
     {
      "state": [
       "UT"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "In the most expedient time possible without unreasonable delay"
   },
   "dueText": "The law sets no number of days: notification is given in the most expedient time possible without unreasonable delay, after determining the scope of the breach and restoring the system's integrity.",
   "weight": 50,
   "source": "us_x_ut_breach_src",
   "verified": true,
   "penalty": "A civil penalty of up to $2,500 for violations concerning one consumer, and up to $100,000 in total for related violations concerning more than one consumer (more in some cases).",
   "roll": false
  },
  {
   "id": "us_x_va_newhire",
   "name": "Report new hires to Virginia",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Virginia Department of Social Services, Virginia New Hire Reporting Center",
   "brief": "Employers report newly hired and rehired employees (rehired after at least 60 consecutive days away), and new independent contractors, to the Virginia New Hire Reporting Center, online, by mail, phone or fax.",
   "why": "You have employees in Virginia.",
   "applies": {
    "all": [
     {
      "state": [
       "VA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's start date (independent contractors: within 20 days of the start of the contract)"
   },
   "dueText": "Virginia law (§ 63.2-1946) requires all employers to report newly hired and re-hired employees and independent contractors to a state directory within 20 days of the employee's start date.",
   "weight": 60,
   "source": "us_x_va_newhire_src",
   "verified": true,
   "form": "New hire report (online, mail, phone or fax)",
   "note": "Neither the DSS page nor § 63.2-1946 states a penalty.",
   "roll": false
  },
  {
   "id": "us_x_va_uiwage",
   "name": "Virginia quarterly unemployment tax report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Virginia Employment Commission",
   "brief": "Employers file the quarterly unemployment tax and wage report with the Virginia Employment Commission (through ESS, eForm or Web Upload) and pay the tax due.",
   "why": "You have employees in Virginia.",
   "applies": {
    "all": [
     {
      "state": [
       "VA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Quarterly reports are due on the last day of the following month: April 30, July 31, October 31 and January 31 (next business day if a weekend or holiday), by midnight of the filing deadline.",
   "weight": 80,
   "source": "us_x_va_uiwage_src",
   "verified": true,
   "form": "Employer's Quarterly Tax Report (FC-20/FC-21)",
   "penalty": "A $100 late filing penalty on each quarterly report filed after the due date (none for quarters with no wages paid); interest accrues on unpaid tax.",
   "roll": false
  },
  {
   "id": "us_x_va_unclaimed",
   "name": "Virginia unclaimed property report and remittance",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Virginia Department of the Treasury, Unclaimed Property Division",
   "brief": "Holders of property presumed abandoned file a report and send the property to the Treasury each year, for the period ending June 30. At least 60 days before reporting, they try to locate each owner of property worth $100 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "VA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Before November 1 each year for the period ending June 30 (insurance corporations: before May 1 for the period ending December 31 of the previous year). Due diligence at least 60 days before the report is submitted.",
   "weight": 55,
   "source": "us_x_va_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest at the delinquent tax rate; up to $50 per account where due diligence was not done; $100 per day a report, payment or delivery is withheld, up to the lesser of $10,000 or 25% of the property's value ($1,000 a day for wilful failure).",
   "roll": false
  },
  {
   "id": "us_x_va_breach",
   "name": "Virginia data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Office of the Attorney General of Virginia",
   "brief": "A business that owns or licenses computerized personal information discloses a breach to the Office of the Attorney General and to each affected Virginia resident. If more than 1,000 people are notified at once, it also tells the national consumer reporting agencies. Employers and payroll providers also tell the Attorney General about unauthorized access to income tax withholding data.",
   "why": "The business holds personal information about Virginia residents.",
   "applies": {
    "all": [
     {
      "state": [
       "VA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovering the breach"
   },
   "dueText": "The law sets no number of days: notice to the Office of the Attorney General and affected residents is given without unreasonable delay (it may be delayed to determine the scope of the breach and restore the system, or at law enforcement's request).",
   "weight": 50,
   "source": "us_x_va_breach_src",
   "verified": true,
   "penalty": "The Attorney General may impose a civil penalty of up to $150,000 per breach or series of similar breaches.",
   "roll": false
  },
  {
   "id": "us_x_va_retire",
   "name": "Enroll in RetirePath Virginia (state retirement savings programme)",
   "dept": "labour",
   "head": "State retirement programme",
   "authority": "Virginia College Savings Plan (Virginia529), RetirePath Virginia",
   "brief": "A business that employed five or more eligible employees in the preceding calendar year and offers no qualified retirement plan must join RetirePath Virginia and enrol its employees, who may opt out, then send their payroll contributions.",
   "why": "You have employees in Virginia and may not offer a workplace retirement plan.",
   "applies": {
    "all": [
     {
      "state": [
       "VA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "By the enrolment deadline in the Board's rollout timeline"
   },
   "dueText": "Participation is mandatory for eligible employers, who enrol in accordance with the timeline the Board sets; the statute gives no fixed date.",
   "weight": 50,
   "source": "us_x_va_retire_src",
   "verified": false,
   "form": "RetirePath Virginia employer registration",
   "penalty": "The Board may set penalties for noncompliance of up to $200 per eligible employee a year.",
   "note": "Who it applies to was read in the statute, but no enrolment date: the programme's own site (virginia529.com/retire, redirecting to retirepathva.com) returned no readable content. Only employers with five or more eligible employees and no qualified plan are covered, which the shared employee question does not test.",
   "roll": false
  },
  {
   "id": "us_x_vt_newhire",
   "name": "Report new hires to Vermont",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Vermont Department of Labor",
   "brief": "All employers report each new hire (including a rehire separated for at least 60 consecutive days) to the Department of Labor: the employee's name, address, first date of employment and Social Security number, and the employer's name, address and federal ID number. Reports are electronic when practicable.",
   "why": "You have employees in Vermont.",
   "applies": {
    "all": [
     {
      "state": [
       "VT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 calendar days of the first date of employment"
   },
   "dueText": "Employers shall report new hires within 10 calendar days of the first date of employment for a new employee.",
   "weight": 60,
   "source": "us_x_vt_newhire_src",
   "verified": true,
   "form": "New hire report (Department of Labor e-Services)",
   "penalty": "If the failure to report results from collusion between employer and employee, the employer is liable to the obligee for the wages that should have been withheld, up to $500.",
   "note": "Vermont's deadline (10 days) is shorter than the federal 20 days. The Department of Labor's own new-hire page (labor.vermont.gov) refused automated access (CloudFront 403); the rule was read in the statute.",
   "roll": false
  },
  {
   "id": "us_x_vt_uiwage",
   "name": "Vermont quarterly unemployment wage and contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Vermont Department of Labor, Unemployment Insurance and Wages Division",
   "brief": "Employers file a quarterly unemployment contribution report and pay contributions to the Vermont Department of Labor.",
   "why": "You have employees in Vermont.",
   "applies": {
    "all": [
     {
      "state": [
       "VT"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "event",
    "text": "Each calendar quarter; confirm the due date with the Vermont Department of Labor"
   },
   "dueText": "Not confirmed: the Department of Labor's quarterly reporting page and employer handbook refused automated access, and the statute leaves the due date to the Department. Confirm the date there.",
   "weight": 80,
   "source": "us_x_vt_uiwage_src",
   "verified": false,
   "form": "Employer's quarterly wage and contribution report (C-101)",
   "penalty": "$100 for each contribution report not filed by its due date (may be waived or reduced for reasonable cause).",
   "note": "labor.vermont.gov returned CloudFront 403 on every page tried (quarterly reporting page, employer handbook). The penalty was read in the statute; the quarterly due date was not read.",
   "roll": false
  },
  {
   "id": "us_x_vt_unclaimed",
   "name": "Vermont unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Vermont State Treasurer, Unclaimed Property Division",
   "brief": "A holder of property presumed abandoned reports it to the State Treasurer each year, covering the calendar year before. Between 180 and 60 days before filing it notifies each owner of property worth $50 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "VT"
      ]
     },
     {
      "q": "us_x_unclaimed",
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
      1
     ]
    ]
   },
   "dueText": "Before May 1 of each year, covering the 12 months preceding January 1. Owner notices: not more than 180 days nor less than 60 days before filing. An extension may be requested before the due date.",
   "weight": 55,
   "source": "us_x_vt_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest on property reported, paid or delivered late, and a civil penalty of $200 for each day the duty is not performed, up to $5,000.",
   "note": "The Treasurer's holder pages and 2026 Holder Reporting Manual (vermonttreasurer.gov) refused automated access (403); the rule was read in the statute.",
   "roll": false
  },
  {
   "id": "us_x_vt_breach",
   "name": "Vermont data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Vermont Attorney General (or Department of Financial Regulation for regulated entities)",
   "brief": "A business that owns or licenses personal information or login credentials notifies affected consumers of a security breach, and gives the Attorney General (or, if it is regulated by it, the Department of Financial Regulation) a preliminary notice.",
   "why": "The business holds personal information about Vermont residents.",
   "applies": {
    "all": [
     {
      "state": [
       "VT"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Consumers: no later than 45 days after discovery. Attorney General: preliminary notice within 14 business days of discovery, or when consumers are notified if sooner"
   },
   "dueText": "Notice to consumers in the most expedient time possible and without unreasonable delay, but not later than 45 days after the discovery or notification. Preliminary notice to the Attorney General or the Department within 14 business days of discovery, or when consumers are notified, whichever is sooner.",
   "weight": 50,
   "source": "us_x_vt_breach_src",
   "verified": true,
   "note": "The penalty is not set in this section.",
   "roll": false
  },
  {
   "id": "us_x_wa_newhire",
   "name": "Report new hires to Washington",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Washington State Department of Social and Health Services, Division of Child Support",
   "brief": "Employers report all newly hired and rehired employees (back after at least 60 consecutive days away) working in Washington to the Division of Child Support, whatever their age or hours.",
   "why": "You have employees in Washington.",
   "applies": {
    "all": [
     {
      "state": [
       "WA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of the employee's start date (hire, rehire or return to work)"
   },
   "dueText": "Report all newly hired and rehired employees to the Division of Child Support within 20 days of hire or rehire, regardless of their age or the numbers of hours worked.",
   "weight": 60,
   "source": "us_x_wa_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "A civil penalty of $25 per month per employee, or $500 if the failure results from a conspiracy between employer and employee; all violations in one month count as one.",
   "roll": false
  },
  {
   "id": "us_x_wa_uiwage",
   "name": "Washington quarterly unemployment tax and wage report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Washington Employment Security Department",
   "brief": "Employers file an unemployment tax and wage report and pay the tax every quarter. A quarter with no payroll still needs a no-payroll report.",
   "why": "You have employees in Washington.",
   "applies": {
    "all": [
     {
      "state": [
       "WA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Due on the last day of the month after the last day of each quarter: April 30, July 31, October 31 and January 31 (next business day if a weekend or state holiday).",
   "weight": 80,
   "source": "us_x_wa_uiwage_src",
   "verified": true,
   "form": "Quarterly tax and wage report",
   "penalty": "$25 for each late report. Late tax: interest of 1% a month, plus 5% (at least $10) in the first month, another 5% in the second and another 10% in the third. Incomplete or wrongly formatted reports can be penalised after a first warning.",
   "roll": false
  },
  {
   "id": "us_x_wa_unclaimed",
   "name": "Washington unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Washington State Department of Revenue, Unclaimed Property",
   "brief": "Businesses holding unclaimed property file a report and pay it to the Department of Revenue every year, covering the 12 months before July 1. Due-diligence letters go to owners of property worth $75 or more, 60 to 180 days before the report is sent.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "WA"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      10,
      31
     ]
    ]
   },
   "dueText": "Filed and paid on or before October 31 each year, covering the 12 months preceding July 1 (insurance companies: April 30). Due-diligence letters: at least 60 and no more than 180 days before the report is sent.",
   "weight": 55,
   "source": "us_x_wa_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest on amounts paid late; a penalty of 10% of amounts not paid or property not delivered; up to $100 a day (maximum $5,000) for wilfully failing to file or to send owner notices; larger penalties for fraud or evasion.",
   "roll": false
  },
  {
   "id": "us_x_wa_breach",
   "name": "Washington data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Washington State Attorney General",
   "brief": "A business that owns or licenses personal information notifies affected Washington residents of a breach. If more than 500 Washington residents must be notified for one breach, it also notifies the Attorney General.",
   "why": "The business holds personal information about Washington residents.",
   "applies": {
    "all": [
     {
      "state": [
       "WA"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Residents: no more than 30 calendar days after the breach was discovered. Attorney General (more than 500 residents): no more than 30 days after discovery"
   },
   "dueText": "Notice to consumers in the most expedient time possible, without unreasonable delay, and no more than thirty calendar days after the breach was discovered. Notice to the attorney general (more than 500 Washington residents) no more than thirty days after the breach was discovered.",
   "weight": 50,
   "source": "us_x_wa_breach_src",
   "verified": true,
   "note": "This section does not state a penalty amount.",
   "roll": false
  },
  {
   "id": "us_x_wa_pfml",
   "name": "Washington Paid Family and Medical Leave quarterly report and premiums",
   "dept": "labour",
   "head": "Paid leave and disability",
   "authority": "Washington Employment Security Department, Paid Leave",
   "brief": "Every employer files a quarterly Paid Family and Medical Leave report with each employee's name, Social Security number, date of birth, wages and hours, and the premiums deducted, and remits the premiums. A no-payroll report is filed for a quarter with no wages.",
   "why": "You have employees in Washington.",
   "applies": {
    "all": [
     {
      "state": [
       "WA"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "The quarterly reports must be submitted by the last day of the month following the end of the calendar quarter being reported (next business day if that is a weekend or legal holiday).",
   "weight": 70,
   "source": "us_x_wa_pfml_src",
   "verified": true,
   "form": "Paid Leave quarterly report",
   "note": "paidleave.wa.gov (the program's reporting page and employer toolkit) refused automated access (403), so the late-report penalty and interest were not read. The WA Cares Fund long-term care premium was not researched.",
   "roll": false
  },
  {
   "id": "us_x_wi_newhire",
   "name": "Report new hires to Wisconsin",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Wisconsin Department of Workforce Development (State Directory of New Hires)",
   "brief": "Employers report each newly hired employee, and each employee rehired, recalled or returning to work after an unpaid interval of more than 60 days, to the State Directory of New Hires.",
   "why": "You have employees in Wisconsin.",
   "applies": {
    "all": [
     {
      "state": [
       "WI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hire (or of rehire or return to work)"
   },
   "dueText": "Federal and state law requires all Wisconsin employers and labor organizations with a FEIN to report to the State Directory of New Hires within 20 days.",
   "weight": 60,
   "source": "us_x_wi_newhire_src",
   "verified": true,
   "form": "New hire report",
   "note": "The DWD page does not say from which day the 20 days run or state a penalty.",
   "roll": false
  },
  {
   "id": "us_x_wi_uiwage",
   "name": "Wisconsin quarterly unemployment contribution and wage reports",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Wisconsin Department of Workforce Development, Unemployment Insurance Division",
   "brief": "Employers file a quarterly contribution (tax) report and a quarterly wage report and pay unemployment tax on each employee's first $14,000 of wages a year. Employers with 25 or more employees must file online.",
   "why": "You have employees in Wisconsin.",
   "applies": {
    "all": [
     {
      "state": [
       "WI"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Contribution reports are due by the close of the month following the end of the calendar quarter: April 30, July 31, October 31 and January 31 (next day that is not a weekend or holiday).",
   "weight": 80,
   "source": "us_x_wi_uiwage_src",
   "verified": true,
   "form": "Quarterly Contribution Report (UCT-101) and Quarterly Wage Report (UC-7823)",
   "penalty": "Wage report filed within 30 days after the due date: $50. Filed more than 30 days late: the greater of $100 or $20 per employee. Paper filing when online filing is required: $25.",
   "roll": false
  },
  {
   "id": "us_x_wi_unclaimed",
   "name": "Wisconsin unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Wisconsin Department of Revenue, Unclaimed Property",
   "brief": "Any holder of unclaimed property reports and pays it to the Department of Revenue each year, for the period ending June 30. Letters go by first-class mail to owners of property worth $50 or more, between July 1 and September 1. Financial institutions, utilities and life insurers with a Wisconsin presence file even when they have nothing to report.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "WI"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "All holder reports and payments are due by November 1 for the filing period ending June 30 (in 2026, Monday November 2, because November 1 is a Sunday). Due-diligence letters must be sent between July 1 and September 1. A 60-day extension can be requested in September and October.",
   "weight": 55,
   "source": "us_x_wi_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "A $150 penalty for a late report (and up to $100 a day if a report requested in writing is not filed); a penalty of 15% of the value of property paid or delivered late.",
   "roll": false
  },
  {
   "id": "us_x_wi_breach",
   "name": "Wisconsin data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Wisconsin Department of Agriculture, Trade and Consumer Protection",
   "brief": "A business that learns personal information it holds was acquired without authorisation notifies the people whose information was acquired, by mail or a method it has used with them before. If more than 1,000 people are affected at one time, it also notifies the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about Wisconsin residents.",
   "applies": {
    "all": [
     {
      "state": [
       "WI"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within a reasonable time, not more than 45 days after learning of the unauthorized acquisition"
   },
   "dueText": "The notice must be given within a reasonable time, not to exceed 45 days after the entity learns of the unauthorized acquisition.",
   "weight": 50,
   "source": "us_x_wi_breach_src",
   "verified": true,
   "note": "The statute (Wis. Stat. § 134.98) could not be fetched: docs.legis.wisconsin.gov reset the connection on three tries. The DATCP summary gives no penalty.",
   "roll": false
  },
  {
   "id": "us_x_wv_newhire",
   "name": "Report new hires to West Virginia",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "West Virginia Bureau for Child Support Enforcement",
   "brief": "Employers report each hire, rehire or return to work of an employee, and each independent contractor paid $2,500 or more in a year, to the state's new hire directory.",
   "why": "You have employees in West Virginia.",
   "applies": {
    "all": [
     {
      "state": [
       "WV"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 14 days of the date of hiring, rehiring or return to work"
   },
   "dueText": "Within fourteen days of the date of the hiring, rehiring or return to work of the employee or independent contractor. Employers reporting electronically twice a month send reports not less than 12 nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_wv_newhire_src",
   "verified": true,
   "form": "New hire report",
   "penalty": "A civil penalty of no more than $25 per failure, or no more than $500 if the failure results from a conspiracy between employer and employee or contractor.",
   "note": "West Virginia's deadline (14 days) is shorter than the federal 20 days.",
   "roll": false
  },
  {
   "id": "us_x_wv_uiwage",
   "name": "West Virginia quarterly unemployment wage and contribution report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "WorkForce West Virginia",
   "brief": "Employers file a quarterly wage report and contribution report and pay unemployment contributions every quarter.",
   "why": "You have employees in West Virginia.",
   "applies": {
    "all": [
     {
      "state": [
       "WV"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "One month after the end of each calendar quarter: quarter ending March 31 due April 30, June 30 due July 31, September 30 due October 31, December 31 due January 31.",
   "weight": 80,
   "source": "us_x_wv_uiwage_src",
   "verified": true,
   "form": "Quarterly wage and contribution report",
   "penalty": "Late payment penalty of the greater of $50 or 10% of the contribution due, up to $500; interest of 1% a month, compounded quarterly.",
   "roll": false
  },
  {
   "id": "us_x_wv_unclaimed",
   "name": "West Virginia unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "West Virginia State Treasurer, Unclaimed Property Division",
   "brief": "A holder of property presumed abandoned reports it to the State Treasurer each year, covering the 12 months before July 1. Between 120 and 60 days before filing, it sends written notice to each owner of property worth $50 or more.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "WV"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "Before November 1 of each year, covering the twelve months next preceding July 1 (life insurance companies: before May 1 for the preceding calendar year). Owner notices: not more than 120 nor less than 60 days before filing.",
   "weight": 55,
   "source": "us_x_wv_unclaimed_src",
   "verified": true,
   "form": "Annual holder report",
   "penalty": "Interest at 12% a year; a civil penalty of $200 for each day the report, payment or delivery is withheld, up to $5,000 ($1,000 a day up to $25,000 plus 25% of the property for wilful failure).",
   "note": "The Treasurer's own holder pages were not read; the rule was read in the statute.",
   "roll": false
  },
  {
   "id": "us_x_wv_breach",
   "name": "West Virginia data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "West Virginia Attorney General",
   "brief": "A business that owns or licenses computerized personal information notifies each West Virginia resident whose unencrypted information was accessed and acquired in a breach that causes, or is believed to cause, identity theft or fraud. If more than 1,000 people must be notified, it also tells the nationwide consumer reporting agencies.",
   "why": "The business holds personal information about West Virginia residents.",
   "applies": {
    "all": [
     {
      "state": [
       "WV"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Without unreasonable delay after discovering the breach"
   },
   "dueText": "The law sets no number of days: notice is made without unreasonable delay (it may wait for law enforcement, or for measures to determine the scope of the breach and restore the system).",
   "weight": 50,
   "source": "us_x_wv_breach_src",
   "verified": true,
   "penalty": "Only for repeated and wilful violations, a court may impose a civil penalty of up to $150,000 per breach or series of similar breaches; the Attorney General brings the action.",
   "roll": false
  },
  {
   "id": "us_x_wy_newhire",
   "name": "Report new hires to Wyoming",
   "dept": "labour",
   "head": "New-hire reporting",
   "authority": "Wyoming Department of Workforce Services (State Directory of New Hires)",
   "brief": "Each employer reports every new employee to the Department of Workforce Services: the employee's name, address, Social Security number and first day of paid work, and the employer's name, address and federal ID number, on a W-4 or an equivalent form.",
   "why": "You have employees in Wyoming.",
   "applies": {
    "all": [
     {
      "state": [
       "WY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 20 days of hiring a new employee"
   },
   "dueText": "Within twenty days of hiring a new employee; employers transmitting electronically may instead send two monthly transmissions not less than 12 nor more than 16 days apart.",
   "weight": 60,
   "source": "us_x_wy_newhire_src",
   "verified": true,
   "form": "W-4 or equivalent form (Wyoming New Hire Reporting Center)",
   "note": "Neither the statute section nor the Department's page states a penalty.",
   "roll": false
  },
  {
   "id": "us_x_wy_uiwage",
   "name": "Wyoming quarterly unemployment insurance report",
   "dept": "labour",
   "head": "Unemployment insurance",
   "authority": "Wyoming Department of Workforce Services, Unemployment Insurance",
   "brief": "Employers file their quarterly unemployment insurance wage report and pay contributions through the WYUI portal every quarter.",
   "why": "You have employees in Wyoming.",
   "applies": {
    "all": [
     {
      "state": [
       "WY"
      ]
     },
     {
      "q": "us_employees",
      "yes": true
     }
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 1
   },
   "dueText": "Q1 due April 30 (delinquent May 1), Q2 due July 31 (delinquent August 1), Q3 due October 31 (delinquent November 1), Q4 due January 31 (delinquent February 1); next business day if the due date is a weekend or holiday.",
   "weight": 80,
   "source": "us_x_wy_uiwage_src",
   "verified": true,
   "form": "Quarterly wage report (WYUI)",
   "penalty": "Contributions not paid on the due date bear interest of 2% per month or part of a month until paid.",
   "note": "Neither the Department's page nor W.S. 27-3-510 states a flat late-filing penalty; only the interest on late contributions was read.",
   "roll": false
  },
  {
   "id": "us_x_wy_unclaimed",
   "name": "Wyoming unclaimed property report",
   "dept": "state",
   "head": "Unclaimed property",
   "authority": "Wyoming State Treasurer's Office, Unclaimed Property Division",
   "brief": "Holders of unclaimed property report and remit it to the State Treasurer each year, online in the NAUPA format, for the period ending June 30. Not more than 120 days before filing, they send a notice to each owner of property worth $50 or more. Negative reports are not required.",
   "why": "The business holds property that belongs to someone else and has gone unclaimed.",
   "applies": {
    "all": [
     {
      "state": [
       "WY"
      ]
     },
     {
      "q": "us_x_unclaimed",
      "yes": true
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
   "dueText": "All reports and remittances are due on or before November 1, for the reporting period ending the preceding June 30. Owner notices: not more than 120 days before filing.",
   "weight": 55,
   "source": "us_x_wy_unclaimed_src",
   "verified": true,
   "form": "Annual holder report (NAUPA format, online)",
   "penalty": "Interest at 10% above the 52-week Treasury bill rate on property paid late; for wilful failure, a civil penalty of up to $100 a day for an unfiled report and 25% of the value of property not paid or delivered.",
   "roll": false
  },
  {
   "id": "us_x_wy_breach",
   "name": "Wyoming data breach notification",
   "dept": "privacy",
   "head": "Data breach notification",
   "authority": "Wyoming Attorney General",
   "brief": "A business that owns or licenses computerized personal identifying information about Wyoming residents investigates any breach promptly and, if misuse has occurred or is reasonably likely, notifies each affected resident.",
   "why": "The business holds personal information about Wyoming residents.",
   "applies": {
    "all": [
     {
      "state": [
       "WY"
      ]
     },
     {
      "q": "us_x_personal_info",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "As soon as possible, in the most expedient time possible and without unreasonable delay"
   },
   "dueText": "The law sets no number of days: notice is given as soon as possible, in the most expedient time possible and without unreasonable delay (law enforcement may delay it in writing).",
   "weight": 50,
   "source": "us_x_wy_breach_src",
   "verified": true,
   "note": "The penalty provisions of the act were not read.",
   "roll": false
  },
  {
   "id": "us_x_g_passport",
   "name": "Renew your US passport",
   "dept": "personal",
   "head": "Passport",
   "authority": "US Department of State",
   "brief": "A US passport issued at age 16 or older is valid for 10 years. Renew it before it runs out: some countries and airlines refuse a passport with less than 6 months left.",
   "why": "You hold a US passport, and it stops being valid for travel on its expiry date.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_passport",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 10 years, before the expiry date in the passport (renew early: some countries want 6 months left)"
   },
   "dueText": "A regular passport or passport card issued to an applicant 16 years of age or older is valid for ten years from date of issue. You can renew an expired passport only if it was issued within the last 15 years.",
   "weight": 55,
   "source": "us_x_g_src_cfr_passport",
   "verified": true,
   "form": "DS-82 (renewal by mail) or DS-11",
   "penalty": "An expired passport cannot be used to travel. A passport issued more than 15 years ago cannot be renewed: you apply again in person (Form DS-11).",
   "note": "travel.state.gov refused automated access (HTTP 403); validity read on the regulation (govinfo, 2024 edition) and the 6-month and 15-year points on usa.gov (updated 2026-03-23).",
   "roll": false
  },
  {
   "id": "us_x_g_child_passport",
   "name": "Renew your child's US passport (new application)",
   "dept": "personal",
   "head": "Passport",
   "authority": "US Department of State",
   "brief": "A passport issued to a child under 16 is valid for 5 years and cannot be renewed: the child needs a new application in person before travelling again.",
   "why": "Your child under 16 holds a US passport, which is valid for 5 years only.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_child_passport",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, before the expiry date in the child's passport"
   },
   "dueText": "Passports for children under age 16 are valid for 5 years. You cannot renew your child's passport.",
   "weight": 40,
   "source": "us_x_g_src_usa_child",
   "verified": true,
   "form": "DS-11",
   "penalty": "An expired passport cannot be used to travel; the child must apply for a new passport in person.",
   "roll": false
  },
  {
   "id": "us_x_g_sss",
   "name": "Register with Selective Service",
   "dept": "personal",
   "head": "Status",
   "authority": "Selective Service System",
   "brief": "Almost every man who is a US citizen or lives in the United States must register with Selective Service within 30 days of turning 18. Late registration is accepted until the 26th birthday.",
   "why": "You are a man aged 18 through 25 who is a US citizen or lives in the United States.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_sss",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 30 days after your 18th birthday (late registration accepted until you turn 26)"
   },
   "dueText": "According to law, a man must register with Selective Service within 30 days of his 18th birthday. Selective Service accepts late registrations up until a man reaches his 26th birthday.",
   "weight": 70,
   "source": "us_x_g_src_sss_26",
   "verified": true,
   "form": "SSS registration",
   "penalty": "Failure to register is a felony punishable by a fine of up to $250,000 and/or 5 years imprisonment. A man who does not register may lose eligibility for most federal employment, job training under WIOA, state-funded student aid and employment in many states, and US citizenship for immigrant men.",
   "note": "Who must register read on the 'Who Needs to Register' page: 'Almost all male US citizens and male immigrants, who are 18 through 25, are required to register'. Some categories of non-citizen are exempt (see the SSS chart).",
   "roll": false
  },
  {
   "id": "us_x_g_i90",
   "name": "Renew your green card",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "US Citizenship and Immigration Services",
   "brief": "A 10-year green card must be renewed on Form I-90 when it has expired or will expire within the next six months. Permanent residence itself does not end, but the card is your proof of status.",
   "why": "You hold a 10-year green card.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_green_card",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 10 years, within the 6 months before the expiry date on the card"
   },
   "dueText": "File Form I-90 if your Green Card is either expired or will expire within the next six months.",
   "weight": 70,
   "source": "us_x_g_src_i90",
   "verified": true,
   "form": "Form I-90",
   "note": "The page does not state a penalty for an expired card. The 10-year card length was not stated on the page read; the 6-month window is.",
   "roll": false
  },
  {
   "id": "us_x_g_i751",
   "name": "Remove the conditions on your green card",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "US Citizenship and Immigration Services",
   "brief": "A 2-year conditional green card based on marriage ends unless you file Form I-751 in the 90 days just before it expires (filed jointly with your spouse).",
   "why": "You hold a conditional green card based on marriage.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_conditional",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within the 90 days before the expiry date on your conditional green card"
   },
   "dueText": "You must file your Form I-751 during the 90-day period immediately before your conditional residence expires.",
   "weight": 85,
   "source": "us_x_g_src_i751",
   "verified": true,
   "form": "Form I-751",
   "penalty": "If you do not file, you could lose your conditional permanent resident status and could be removed from the United States.",
   "note": "Filed too early, the petition may be returned. Individual filers asking for a waiver of the joint filing may file at any time before status expires. Investors file Form I-829 in the same 90-day window (not modelled).",
   "roll": false
  },
  {
   "id": "us_x_g_ar11",
   "name": "Report your new address to USCIS",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "US Citizenship and Immigration Services",
   "brief": "Every non-citizen in the United States must tell USCIS about a change of address within 10 days of moving, online or on Form AR-11.",
   "why": "You live in the United States and are not a US citizen.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_noncitizen",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days after you move"
   },
   "dueText": "All aliens in the United States must report a change of address to USCIS within 10 days of moving.",
   "weight": 60,
   "source": "us_x_g_src_ar11",
   "verified": true,
   "form": "Form AR-11 (or online)",
   "note": "The USCIS page does not state the penalty. A paper AR-11 does not update USCIS case records; USCIS encourages the online tool.",
   "roll": false
  },
  {
   "id": "us_x_g_ca_dl",
   "name": "Renew your California driver's licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "California Department of Motor Vehicles",
   "brief": "A California driver's licence expires on your 5th birthday after you applied. The DMV mails a notice about 4 months before; you can renew online from 90 days before expiry.",
   "why": "You hold a California driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 5 years, by your birthday on which the licence expires"
   },
   "dueText": "Every original DL expires on the applicant's 5th birthday following the application date. Online renewal is open within 90 days before or 12 months after the expiration date.",
   "weight": 55,
   "source": "us_x_g_src_ca_dl",
   "verified": true,
   "penalty": "It is illegal to drive with an expired DL and you can be cited. There are no late fees to renew a DL that has already expired.",
   "roll": false
  },
  {
   "id": "us_x_g_ca_reg",
   "name": "Renew your California vehicle registration",
   "dept": "personal",
   "head": "Vehicle registration",
   "authority": "California Department of Motor Vehicles",
   "brief": "California vehicle registration is renewed every year, on or before the expiration date on your registration card. There is no grace period; a smog check may be needed first.",
   "why": "You own a vehicle registered in California.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "state": [
       "CA"
      ]
     },
     {
      "q": "us_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, on or before the expiration date shown on your registration card"
   },
   "dueText": "Pay your renewal fees on or before the expiration date shown on your current registration card. The DMV does not offer a grace period for paying your annual vehicle registration fees.",
   "weight": 60,
   "source": "us_x_g_src_ca_regpen",
   "verified": true,
   "penalty": "Late penalties: 1-10 days late 10% of the vehicle licence and weight fees plus $10 registration and $10 CHP late fees; 11-30 days 20% plus $15 + $15; 31 days to 1 year 60% plus $30 + $30; 1-2 years 80% plus $50 + $50; over 2 years 160% plus $100 + $100.",
   "roll": false
  },
  {
   "id": "us_x_g_ca_coa",
   "name": "Tell the California DMV your new address",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "California Department of Motor Vehicles",
   "brief": "California law requires you to tell the DMV within 10 days when you change your address. The licence and the vehicle registration are updated separately unless you choose both.",
   "why": "You hold a California driver's licence or own a California-registered vehicle.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "CA"
      ]
     },
     {
      "any": [
       {
        "q": "us_x_g_dl",
        "yes": true
       },
       {
        "q": "us_x_g_vehicle",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days after you change your address"
   },
   "dueText": "California law requires that you notify DMV within 10 days of changing your address.",
   "weight": 45,
   "source": "us_x_g_src_ca_coa",
   "verified": true,
   "form": "DMV 14 or online",
   "roll": false
  },
  {
   "id": "us_x_g_tx_dl",
   "name": "Renew your Texas driver's licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "Texas Department of Public Safety",
   "brief": "A Texas driver's licence for ages 18 to 84 runs 8 years (2 years from age 85). You can renew up to two years before or after it expires; after two years expired it cannot be renewed.",
   "why": "You hold a Texas driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 8 years (every 2 years from age 85), by the expiry date on the licence"
   },
   "dueText": "Renewal, ages 18 to 84: expires eight years after previous expiration date; 85 and older: expires two years after previous expiration date. You can renew up to two years before or after it expires.",
   "weight": 55,
   "source": "us_x_g_src_tx_dlfees",
   "verified": true,
   "penalty": "Driver licenses or ID cards that have been expired for more than two years cannot be renewed: you must apply for a new one.",
   "note": "A CDL can be renewed only up to one year before it expires.",
   "roll": false
  },
  {
   "id": "us_x_g_tx_coa",
   "name": "Change the address on your Texas licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "Texas Department of Public Safety",
   "brief": "In Texas the address on a driver's licence or ID card must be changed within 30 days after you move.",
   "why": "You hold a Texas driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after moving to your new residence"
   },
   "dueText": "In Texas, your address on a driver license or ID card must be changed within 30 days after moving to your new residence.",
   "weight": 45,
   "source": "us_x_g_src_tx_coa",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_g_tx_reg",
   "name": "Renew your Texas vehicle registration",
   "dept": "personal",
   "head": "Vehicle registration",
   "authority": "Texas Department of Motor Vehicles",
   "brief": "Texas vehicle registration is renewed every year by the expiration month on your sticker. You may drive up to five working days after it expires; after that you can be cited.",
   "why": "You own a vehicle registered in Texas.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "state": [
       "TX"
      ]
     },
     {
      "q": "us_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Every year, by the registration expiration date (online from 90 days before)"
   },
   "dueText": "Annual vehicle registration renewal. A vehicle may be operated up to five working days after the registration expires without penalty.",
   "weight": 60,
   "source": "us_x_g_src_tx_reg",
   "verified": true,
   "penalty": "After the five working days you can receive a citation of up to $200; failing to renew is against the law and may result in a fine.",
   "note": "Since 1 January 2025 non-commercial vehicles no longer need a safety inspection before registration; vehicles in 18 counties still need an emissions inspection.",
   "roll": false
  },
  {
   "id": "us_x_g_ny_dl",
   "name": "Renew your New York driver's licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "New York State Department of Motor Vehicles",
   "brief": "Renew your New York licence by the expiration date printed on it; you can renew from 1 year before to 2 years after. Expired 2 years or more, you start again with tests and a road test.",
   "why": "You hold a New York driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "By the expiration date printed on your licence (renewal opens 1 year before)"
   },
   "dueText": "You can renew up to 1 year before and 2 years after your license expires. If your license expires for 2 years or more, you must apply for an original.",
   "weight": 55,
   "source": "us_x_g_src_ny_dl",
   "verified": true,
   "form": "MV-44 (if no renewal notice)",
   "penalty": "Driving with an expired licence: a ticket of $25 to $40 plus surcharges if 60 days or less after expiry, $75 to $300 plus surcharges if more than 60 days. Expired 2 years or more: apply for an original licence (vision and written tests, pre-licensing course, road test).",
   "note": "The renewal page does not state the licence term; it refers to an '8-year driver license' only in the MCTD fee note. A first licence is issued for up to 5 years (driver's manual, chapter 1).",
   "roll": false
  },
  {
   "id": "us_x_g_ny_reg",
   "name": "Renew your New York vehicle registration",
   "dept": "personal",
   "head": "Vehicle registration",
   "authority": "New York State Department of Motor Vehicles",
   "brief": "Renew your New York vehicle registration before it expires. The vehicle must have been inspected in the past 12 months; a registration expired more than 1 year cannot be renewed.",
   "why": "You own a vehicle registered in New York.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual",
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "state": [
       "NY"
      ]
     },
     {
      "q": "us_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the expiration date on your registration"
   },
   "dueText": "You must renew your vehicle registration before it expires.",
   "weight": 55,
   "source": "us_x_g_src_ny_reg",
   "verified": true,
   "form": "MV-3 renewal notice",
   "penalty": "A registration expired for more than 1 year cannot be renewed: you must register the vehicle again. The page does not state a fine.",
   "note": "The page does not state the registration period (most passenger vehicles in NY are on a 2-year cycle, but this was not read on the page).",
   "roll": false
  },
  {
   "id": "us_x_g_ny_coa",
   "name": "Tell the New York DMV your new address",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "New York State Department of Motor Vehicles",
   "brief": "After a permanent move, change the address on your licence, permit, non-driver ID and every vehicle registration with the DMV within 10 days.",
   "why": "You hold a New York licence or own a New York-registered vehicle.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "NY"
      ]
     },
     {
      "any": [
       {
        "q": "us_x_g_dl",
        "yes": true
       },
       {
        "q": "us_x_g_vehicle",
        "yes": true
       }
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days after you move"
   },
   "dueText": "You must change your address on your license, permit, non-driver ID, and vehicle records with the DMV within 10 days.",
   "weight": 45,
   "source": "us_x_g_src_ny_coa",
   "verified": true,
   "form": "MV-232 or online",
   "roll": false
  },
  {
   "id": "us_x_g_fl_dl",
   "name": "Renew your Florida driver's licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "Florida Department of Highway Safety and Motor Vehicles",
   "brief": "A Florida driver's licence must be renewed every eight years. You can renew up to 18 months before the expiration date.",
   "why": "You hold a Florida driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 8 years, by the expiration date on the licence (renewal opens 18 months before)"
   },
   "dueText": "Customers must renew their Florida driver license or ID card every eight years. Florida driver license holders may renew their credential up to 18 months in advance of the expiration date.",
   "weight": 55,
   "source": "us_x_g_src_fl_dl",
   "verified": true,
   "note": "The page does not state a late fee or penalty. Licences for non-immigrants follow their USCIS-approved stay (not read on this page).",
   "roll": false
  },
  {
   "id": "us_x_g_fl_coa",
   "name": "Update the address on your Florida licence",
   "dept": "personal",
   "head": "Driver's licence",
   "authority": "Florida Department of Highway Safety and Motor Vehicles",
   "brief": "If you move, you have 30 days to update the address on your Florida driver's licence or ID card.",
   "why": "You hold a Florida driver's licence.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_x_g_dl",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days after you change your address"
   },
   "dueText": "If there is a change of address, Florida driver license or ID card holders have 30 days to update their address on the credential.",
   "weight": 45,
   "source": "us_x_g_src_fl_dl",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_g_fl_reg",
   "name": "Renew your Florida vehicle registration",
   "dept": "personal",
   "head": "Vehicle registration",
   "authority": "Florida Department of Highway Safety and Motor Vehicles",
   "brief": "A Florida vehicle registration owned by a person expires at midnight on the first owner's birthday. Renew for one or two years, up to three months in advance.",
   "why": "You own a vehicle registered in Florida.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "state": [
       "FL"
      ]
     },
     {
      "q": "us_x_g_vehicle",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Every 1 or 2 years, by midnight on the first owner's birthday"
   },
   "dueText": "Vehicle registrations expire at midnight on the first owner's birth date unless the owner is a business. Customers may renew their vehicle for a period of one or two years and may renew up to three months in advance.",
   "weight": 60,
   "source": "us_x_g_src_fl_reg",
   "verified": true,
   "penalty": "A delinquent registration fee is charged on late renewal: from $5.00 (licence tax up to $25) to $250.00 (licence tax of $600.01 or more).",
   "roll": false
  },
  {
   "id": "us_x_g_medicare_iep",
   "name": "Sign up for Medicare Part B when you turn 65",
   "dept": "personal",
   "head": "Health coverage",
   "authority": "Centers for Medicare & Medicaid Services",
   "brief": "Your Initial Enrollment Period lasts 7 months around your 65th birthday. If you miss it and have no job-based coverage, you pay a late penalty on the Part B premium for as long as you have Part B.",
   "why": "You are turning 65 and are not yet signed up for Medicare.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_turn65",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "From 3 months before the month you turn 65 until 3 months after it (7 months in all)"
   },
   "dueText": "Your Initial Enrollment Period lasts for 7 months, starting 3 months before you turn 65, and ending 3 months after the month you turn 65.",
   "weight": 60,
   "source": "us_x_g_src_mc_iep",
   "verified": true,
   "penalty": "Part B late enrollment penalty: 10% for each full 12-month period that you could have signed up, added to the monthly premium for as long as you have Part B. Part D: an extra 1% a month if you go 63 days or more without creditable drug coverage.",
   "note": "People already getting Social Security benefits are usually enrolled automatically; this was not read on the page used. No penalty generally applies with a Special Enrollment Period (coverage from current work).",
   "roll": false
  },
  {
   "id": "us_x_g_isf",
   "name": "Importer Security Filing (10+2) for ocean cargo",
   "dept": "trade",
   "head": "Imports",
   "authority": "US Customs and Border Protection",
   "brief": "For goods coming to the United States by ship, the importer (the goods' owner, buyer, consignee or their agent) files security data with CBP before the cargo is loaded on the vessel abroad.",
   "why": "The business imports goods that arrive by ocean vessel.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_import",
      "yes": true
     },
     {
      "q": "us_x_g_import_ocean",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Each ocean shipment, at least 24 hours before the cargo is laden aboard the vessel bound for the United States"
   },
   "dueText": "The ISF is submitted 24 hours prior to the cargo being laden on a vessel destined to the United States. CBP is measuring timeliness based on the vessel departure date of the vessel destined to the United States minus 24 hours.",
   "weight": 70,
   "source": "us_x_g_src_cbp_isf",
   "verified": true,
   "form": "ISF",
   "penalty": "Liquidated damages of $5,000 per violation under the customs bond (late, inaccurate or incomplete filing); failure to comply can also bring increased inspections and delay of cargo.",
   "note": "Read in CBP's ISF FAQ (May 2023). The CBP ISF web page (last modified 28 Jul 2023) gives no deadline itself.",
   "roll": false
  },
  {
   "id": "us_x_g_entry",
   "name": "File the customs entry for imported goods",
   "dept": "trade",
   "head": "Imports",
   "authority": "US Customs and Border Protection",
   "brief": "When goods arrive, the importer of record files entry documents with CBP to get the goods released.",
   "why": "The business imports goods into the United States.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_import",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 calendar days after the shipment arrives"
   },
   "dueText": "Entry documents must be filed within 15 calendar days of the date that a shipment arrives.",
   "weight": 75,
   "source": "us_x_g_src_cbp_entry",
   "verified": true,
   "form": "Entry / cargo release (CBP Form 3461 or ACE)",
   "note": "The page does not state the consequence of late entry.",
   "roll": false
  },
  {
   "id": "us_x_g_entry_summary",
   "name": "File the entry summary and deposit duties",
   "dept": "trade",
   "head": "Imports",
   "authority": "US Customs and Border Protection",
   "brief": "After entry, the importer files the entry summary (classification, value, origin) and deposits the estimated duties.",
   "why": "The business imports goods into the United States.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_import",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 working days after entry of the merchandise"
   },
   "dueText": "An entry summary must be filed and estimated duties deposited within 10 working days after entry of the merchandise.",
   "weight": 80,
   "source": "us_x_g_src_cbp_entry",
   "verified": true,
   "form": "CBP Form 7501",
   "note": "The same page also says 'within 10 days of the cargo's release from CBP custody'. It does not state the penalty.",
   "roll": false
  },
  {
   "id": "us_x_g_cbp_records",
   "name": "Keep import records for five years",
   "dept": "trade",
   "head": "Imports",
   "authority": "US Customs and Border Protection",
   "brief": "Importers must keep the records of each entry and produce them when CBP asks, generally for 5 years from the date of entry.",
   "why": "The business imports goods into the United States.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_import",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "For 5 years from the date of entry"
   },
   "dueText": "Any record required to be made, kept and rendered for examination or inspection under Part 163 must be kept for 5 years from the date of entry.",
   "weight": 55,
   "source": "us_x_g_src_cbp_rk",
   "verified": true,
   "penalty": "Failure to produce a demanded entry record: up to $100,000 or 75% of the appraised value (willful), or up to $10,000 or 40% (negligent), for each release of merchandise, whichever is less.",
   "note": "CBP's guide is dated January 2005; the 5-year rule is 19 CFR 163.4, whose current text could not be opened (eCFR shows a bot check). Some records have shorter periods (drawback, certain informal entries).",
   "roll": false
  },
  {
   "id": "us_x_g_eei",
   "name": "File Electronic Export Information (AES)",
   "dept": "trade",
   "head": "Exports",
   "authority": "US Census Bureau",
   "brief": "The exporter (US principal party in interest) or its agent files Electronic Export Information in the Automated Export System for each shipment over $2,500 per Schedule B number, or that needs a licence, before the goods leave.",
   "why": "The business exports goods above the filing threshold.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_export",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Each shipment: 24 hours before loading on a vessel; 2 hours before an aircraft departs; 1 hour before a truck reaches the border; 2 hours before a train reaches the border"
   },
   "dueText": "Non-USML shipments: vessel 24 hours prior to loading; truck 1 hour prior to truck arriving at U.S. border; air 2 hours prior to scheduled departure time; rail 2 hours prior to train arriving at U.S. border; mail 2 hours prior to export.",
   "weight": 75,
   "source": "us_x_g_src_census_qg",
   "verified": true,
   "form": "EEI in AES",
   "note": "USML (defence) shipments have longer lead times (8 or 24 hours); used self-propelled vehicles 72 hours before export. The penalty amounts were not stated in the quick guide.",
   "roll": false
  },
  {
   "id": "us_x_g_eei_records",
   "name": "Keep export records for five years",
   "dept": "trade",
   "head": "Exports",
   "authority": "US Census Bureau",
   "brief": "The exporter keeps the documents for each export filed in AES for five years from the date of export.",
   "why": "The business exports goods that need an EEI filing.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_export",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "For 5 years from the date of export"
   },
   "dueText": "Retain documentation for five years from the date of export (§ 30.10).",
   "weight": 45,
   "source": "us_x_g_src_census_qg",
   "verified": true,
   "roll": false
  },
  {
   "id": "us_x_g_fda_prior_notice",
   "name": "Prior notice of imported food to FDA",
   "dept": "trade",
   "head": "Imports",
   "authority": "US Food and Drug Administration",
   "brief": "FDA must receive prior notice of food, including animal feed, that is imported or offered for import, before it reaches the US port.",
   "why": "The business imports food or animal feed.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_import_food",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Each shipment: at least 2 hours before arrival by road, 4 hours by rail or air, 8 hours by water, or before international mail is sent"
   },
   "dueText": "No less than 2 hours before arriving at the port of arrival (road); 4 hours (rail and air); 8 hours (water); before the food is sent (international mail). No more than 30 days (ABI/ACS) or 15 days (PNSI) before arrival.",
   "weight": 65,
   "source": "us_x_g_src_fda_pn",
   "verified": true,
   "form": "Prior Notice (PNSI or ABI/ACS)",
   "penalty": "Food imported or offered for import with inadequate prior notice is subject to refusal and must be held at the port of entry; it is a prohibited act.",
   "note": "Guidance dated August 2011, page current as of 2018-11-05. FDA's prior notice page (current as of 2026-10-05) adds that international mail notices must include the mail service and tracking number from 1 October 2026, enforced from 1 May 2027.",
   "roll": false
  },
  {
   "id": "us_x_g_ead",
   "name": "Renew your work permit (EAD)",
   "dept": "personal",
   "head": "Immigration status",
   "authority": "US Citizenship and Immigration Services",
   "brief": "An Employment Authorization Document is valid only until the date on the card. To renew it, file Form I-765 at least 90 days before it expires (USCIS generally recommends up to 180 days before).",
   "why": "You hold an Employment Authorization Document.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_ead",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "At least 90 days before the expiry date on your EAD (USCIS recommends filing up to 180 days before)"
   },
   "dueText": "To renew your Employment Authorization Document, file Form I-765 at least 90 days before the expiration. We generally recommend you file up to 180 days before your current EAD expires.",
   "weight": 70,
   "source": "us_x_g_src_i765",
   "verified": true,
   "form": "Form I-765",
   "note": "The page does not state what happens if the EAD expires; USCIS generally does not backdate a renewal EAD to the end of the current one.",
   "roll": false
  },
  {
   "id": "us_x_g_msb_sar",
   "name": "Report suspicious transactions (money services business)",
   "dept": "finance",
   "head": "Anti-money-laundering",
   "authority": "Financial Crimes Enforcement Network (FinCEN)",
   "brief": "Money transmitters, issuers, sellers and redeemers of money orders and traveler's checks must report suspicious transactions of $2,000 or more to FinCEN.",
   "why": "The business is a money services business.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_msb",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 calendar days after first detecting facts that may call for a report (up to 60 days if no suspect is identified)"
   },
   "dueText": "A FinCEN SAR shall be filed no later than 30 calendar days after the date of the initial detection of facts that may constitute a basis for filing a report; if no suspect is identified, filing may be delayed an additional 30 calendar days, but no more than 60 calendar days.",
   "weight": 70,
   "source": "us_x_g_src_sar_instr",
   "verified": true,
   "form": "FinCEN SAR",
   "note": "Threshold ($2,000 for MSBs) read in the same instructions and on FinCEN's MSB SAR page, which lists the MSB types that must file and says a copy and supporting documents are kept five years from filing. Check cashers and currency dealers are not on that page's list. Penalty not stated on these pages.",
   "roll": false
  },
  {
   "id": "us_x_g_msb_ctr",
   "name": "Currency transaction report (money services business)",
   "dept": "finance",
   "head": "Anti-money-laundering",
   "authority": "Financial Crimes Enforcement Network (FinCEN)",
   "brief": "A money services business reports each cash-in or cash-out of more than $10,000 by or for the same person in one business day (transactions added together).",
   "why": "The business is a money services business.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_msb",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 calendar days after the transaction"
   },
   "dueText": "As of April 1, 2013, all FinCEN CTRs must be filed within 15 calendar days of the reported transaction(s).",
   "weight": 70,
   "source": "us_x_g_src_ctr_faq",
   "verified": true,
   "form": "FinCEN CTR",
   "note": "Who and threshold from FinCEN's MSB guide: 'An MSB must file a report of each currency transaction involving cash-in or cash-out of more than $10,000 ... on any one day by or on behalf of the same person.' The guide is undated and old (it cites 31 CFR 103.22, now 31 CFR Chapter X and names IRS Form 4789, since replaced by the FinCEN CTR). The 15-calendar-day deadline is from FinCEN's CTR FAQ (effective 3 Oct 2019). Copies are generally kept five years.",
   "roll": false
  },
  {
   "id": "us_x_g_casino_sar",
   "name": "Report suspicious transactions (casino or card club)",
   "dept": "finance",
   "head": "Anti-money-laundering",
   "authority": "Financial Crimes Enforcement Network (FinCEN)",
   "brief": "Casinos and card clubs report to FinCEN any suspicious transaction involving or adding up to at least $5,000.",
   "why": "The business is a casino or card club.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_casino",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 calendar days after first detecting facts that may call for a report (up to 60 days if no suspect is identified)"
   },
   "dueText": "A FinCEN SAR shall be filed no later than 30 calendar days after the date of the initial detection of facts that may constitute a basis for filing a report; in no case shall reporting be delayed more than 60 calendar days.",
   "weight": 70,
   "source": "us_x_g_src_sar_instr",
   "verified": true,
   "form": "FinCEN SAR",
   "note": "Penalty not stated in the filing instructions. Which casinos are covered (the revenue threshold) was not read.",
   "roll": false
  },
  {
   "id": "us_x_g_casino_ctr",
   "name": "Currency transaction report (casino or card club)",
   "dept": "finance",
   "head": "Anti-money-laundering",
   "authority": "Financial Crimes Enforcement Network (FinCEN)",
   "brief": "Casinos and card clubs report currency transactions by or for one customer that add up to more than $10,000 in a single gaming day.",
   "why": "The business is a casino or card club.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "corporation",
       "llc",
       "nonprofit",
       "branch"
      ]
     },
     {
      "q": "us_x_g_casino",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 15 calendar days after the transaction"
   },
   "dueText": "All FinCEN CTRs must be filed within 15 calendar days of the reported transaction(s).",
   "weight": 70,
   "source": "us_x_g_src_casino_faq",
   "verified": true,
   "form": "FinCEN CTR",
   "note": "Threshold from FinCEN's casino FAQ (2012), which also says 'A casino has 15 gaming days to file a complete report'; the 15-calendar-day rule is from FinCEN's general CTR FAQ, which speaks of financial institutions without naming casinos. Confirm against 31 CFR 1010.306 (eCFR blocked automated access).",
   "roll": false
  },
  {
   "id": "us_x_g_tm_sec71",
   "name": "Declaration of use for a Madrid trademark (Section 71)",
   "dept": "ip",
   "head": "Trademarks",
   "authority": "United States Patent and Trademark Office",
   "brief": "A trademark protected in the US through the Madrid Protocol stays alive only if you file a Section 71 declaration of use: between the 5th and 6th year after the US registration date, between the 9th and 10th, and every 10 years after.",
   "why": "Your US trademark is an extension of an international registration.",
   "applies": {
    "all": [
     {
      "q": "us_x_trademark",
      "yes": true
     },
     {
      "q": "us_x_g_tm_madrid",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Between the 5th and 6th year after the US registration date, then between the 9th and 10th year and every 10 years after"
   },
   "dueText": "Between the fifth and sixth year after the registration date of your extension of protection with the USPTO; between the ninth and 10th years; every 10 years after that. There is a six-month grace period after each deadline (with a fee).",
   "weight": 55,
   "source": "us_x_g_src_madrid",
   "verified": true,
   "form": "Section 71 declaration",
   "penalty": "If you don't file before the end of the grace period, your registration will be canceled.",
   "note": "The international registration itself is renewed with WIPO, not the USPTO. The existing us_x_tm_sec8 / us_x_tm_renew items describe Section 8/9 filings; they should not apply to a Madrid extension.",
   "roll": false
  },
  {
   "id": "us_x_g_sss_update",
   "name": "Tell Selective Service your new address",
   "dept": "personal",
   "head": "Status",
   "authority": "Selective Service System",
   "brief": "A man registered with Selective Service must update his address (and other registration details) within 10 days of a change, until January 1 of the year he turns 26.",
   "why": "You are a man aged 18 through 25 who must be registered with Selective Service.",
   "applies": {
    "all": [
     {
      "kind": [
       "individual"
      ]
     },
     {
      "q": "us_x_g_sss",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 10 days after you move or your details change (until January 1 of the year you turn 26)"
   },
   "dueText": "You are required to update your registration information on file with the agency within 10 days, until January 1 of the year you turn 26.",
   "weight": 40,
   "source": "us_x_g_src_sss_verify",
   "verified": true,
   "form": "SSS Form 2 or online",
   "note": "The page does not state a separate penalty for a late address update.",
   "roll": false
  }
 ],
 "sources": [
  {
   "id": "us_x_src_osha_1904_29",
   "title": "29 CFR 1904.29, Forms (OSHA standard page)",
   "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1904/1904.29",
   "publisher": "Occupational Safety and Health Administration (OSHA)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_osha_1904_32",
   "title": "29 CFR 1904.32, Annual summary (OSHA standard page)",
   "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1904/1904.32",
   "publisher": "Occupational Safety and Health Administration (OSHA)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_osha_1904_41",
   "title": "29 CFR 1904.41, Electronic submission of injury and illness records to OSHA (OSHA standard page)",
   "url": "https://www.osha.gov/laws-regs/regulations/standardnumber/1904/1904.41",
   "publisher": "Occupational Safety and Health Administration (OSHA)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_osha_report",
   "title": "Report a Fatality or Severe Injury",
   "url": "https://www.osha.gov/report",
   "publisher": "Occupational Safety and Health Administration (OSHA)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_dol_posters",
   "title": "Workplace Posters",
   "url": "https://www.dol.gov/general/topics/posters",
   "publisher": "U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_i9_s2",
   "title": "Handbook for Employers M-274, 4.0 Completing Section 2: Employer Review and Verification",
   "url": "https://www.uscis.gov/i-9-central/form-i-9-resources/handbook-for-employers-m-274/40-completing-section-2-employer-review-and-verification",
   "publisher": "U.S. Citizenship and Immigration Services (USCIS)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_everify",
   "title": "E-Verify for federal contractors: Timeframes for Enrollment and Use",
   "url": "https://www.e-verify.gov/employers/federal-contractors/timeframes-for-enrollment-and-use",
   "publisher": "E-Verify (U.S. Department of Homeland Security / USCIS)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_sba_hire",
   "title": "Hire and manage employees",
   "url": "https://www.sba.gov/business-guide/manage-your-business/hire-manage-employees",
   "publisher": "U.S. Small Business Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_flsa21",
   "title": "Fact Sheet #21: Recordkeeping Requirements under the Fair Labor Standards Act (FLSA)",
   "url": "https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping",
   "publisher": "Wage and Hour Division, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_eeoc_records",
   "title": "Recordkeeping Requirements",
   "url": "https://www.eeoc.gov/employers/recordkeeping-requirements",
   "publisher": "U.S. Equal Employment Opportunity Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_fmla_faq",
   "title": "Family and Medical Leave Act: Frequently Asked Questions",
   "url": "https://www.dol.gov/agencies/whd/fmla/faq",
   "publisher": "Wage and Hour Division, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_warn",
   "title": "Plant Closings and Layoffs",
   "url": "https://www.dol.gov/general/topic/termination/plantclosings",
   "publisher": "U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_cobra",
   "title": "An Employer's Guide to Group Health Continuation Coverage Under COBRA",
   "url": "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/publications/an-employers-guide-to-group-health-continuation-coverage-under-cobra",
   "publisher": "Employee Benefits Security Administration, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_5500",
   "title": "Form 5500 corner",
   "url": "https://www.irs.gov/retirement-plans/form-5500-corner",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_ebsa_guide",
   "title": "Reporting and Disclosure Guide for Employee Benefit Plans",
   "url": "https://www.dol.gov/sites/dolgov/files/EBSA/about-ebsa/our-activities/resource-center/publications/reporting-and-disclosure-guide-for-employee-benefit-plans.pdf",
   "publisher": "Employee Benefits Security Administration, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_erisa_faq",
   "title": "FAQs about Retirement Plans and ERISA",
   "url": "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/retirement-plans-and-erisa",
   "publisher": "Employee Benefits Security Administration, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_pbgc",
   "title": "Premium filing due dates",
   "url": "https://www.pbgc.gov/employers-practitioners/premium-filings/filing-due-dates",
   "publisher": "Pension Benefit Guaranty Corporation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_gag",
   "title": "Gag Clause Prohibition Compliance Attestation",
   "url": "https://www.cms.gov/marketplace/about/oversight/other-insurance-protections/gag-clause-prohibition-compliance-attestation",
   "publisher": "Centers for Medicare & Medicaid Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_partd",
   "title": "Creditable Coverage",
   "url": "https://www.cms.gov/medicare/employers-plan-sponsors/creditable-coverage",
   "publisher": "Centers for Medicare & Medicaid Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_hipaa_404",
   "title": "45 CFR 164.404, Notification to individuals (Code of Federal Regulations, 2025 annual edition)",
   "url": "https://www.govinfo.gov/content/pkg/CFR-2025-title45-vol2/xml/CFR-2025-title45-vol2-sec164-404.xml",
   "publisher": "U.S. Government Publishing Office (govinfo.gov), for the Department of Health and Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_hipaa_408",
   "title": "45 CFR 164.408, Notification to the Secretary (Code of Federal Regulations, 2025 annual edition)",
   "url": "https://www.govinfo.gov/content/pkg/CFR-2025-title45-vol2/xml/CFR-2025-title45-vol2-sec164-408.xml",
   "publisher": "U.S. Government Publishing Office (govinfo.gov), for the Department of Health and Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_hbnr",
   "title": "Complying with FTC's Health Breach Notification Rule",
   "url": "https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0",
   "publisher": "Federal Trade Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_safeguards",
   "title": "FTC Safeguards Rule: What Your Business Needs to Know",
   "url": "https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know",
   "publisher": "Federal Trade Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_canspam",
   "title": "CAN-SPAM Act: A Compliance Guide for Business",
   "url": "https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business",
   "publisher": "Federal Trade Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_dnc",
   "title": "Q&A for Telemarketers & Sellers About DNC Provisions in TSR",
   "url": "https://www.ftc.gov/business-guidance/resources/qa-telemarketers-sellers-about-dnc-provisions-tsr-0",
   "publisher": "Federal Trade Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_franchise",
   "title": "Franchise Rule Compliance Guide",
   "url": "https://www.ftc.gov/system/files/documents/plain-language/bus70-franchise-rule-compliance-guide.pdf",
   "publisher": "Federal Trade Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_formd",
   "title": "Form D",
   "url": "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/form-d",
   "publisher": "U.S. Securities and Exchange Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_bea_fdi",
   "title": "International Surveys: Foreign Direct Investment in the United States",
   "url": "https://www.bea.gov/surveys/fdiusurv",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_bea_dia",
   "title": "International Surveys: U.S. Direct Investment Abroad",
   "url": "https://www.bea.gov/surveys/diasurv",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_8300",
   "title": "Form 8300 and reporting cash payments of over $10,000",
   "url": "https://www.irs.gov/businesses/small-businesses-self-employed/form-8300-and-reporting-cash-payments-of-over-10000",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_msb",
   "title": "Money Services Business (MSB) Registration",
   "url": "https://www.fincen.gov/money-services-business-msb-registration",
   "publisher": "Financial Crimes Enforcement Network (FinCEN)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_boi_qa",
   "title": "Beneficial Ownership Information Final Rule: Questions and Answers",
   "url": "https://www.fincen.gov/system/files/2026-08/QAs_BOIFinalRule.pdf",
   "publisher": "Financial Crimes Enforcement Network (FinCEN)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_tier2",
   "title": "EPCRA Sections 311-312 (hazardous chemical inventory reporting)",
   "url": "https://www.epa.gov/epcra/epcra-sections-311-312",
   "publisher": "U.S. Environmental Protection Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_tri",
   "title": "Reporting for TRI Facilities",
   "url": "https://www.epa.gov/toxics-release-inventory-tri-program/reporting-tri-facilities",
   "publisher": "U.S. Environmental Protection Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_bhw",
   "title": "Biennial Hazardous Waste Report",
   "url": "https://www.epa.gov/hwgenerators/biennial-hazardous-waste-report",
   "publisher": "U.S. Environmental Protection Agency",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_mcs150",
   "title": "49 CFR 390.19T, Motor carrier identification reports (Code of Federal Regulations, 2025 annual edition)",
   "url": "https://www.govinfo.gov/content/pkg/CFR-2025-title49-vol5/xml/CFR-2025-title49-vol5-sec390-19T.xml",
   "publisher": "U.S. Government Publishing Office (govinfo.gov), for the Federal Motor Carrier Safety Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_ucr",
   "title": "Unified Carrier Registration Plan (registration site)",
   "url": "https://plan.ucr.gov/",
   "publisher": "Unified Carrier Registration Plan",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_clearinghouse",
   "title": "Drug and Alcohol Clearinghouse: Frequently Asked Questions, Queries",
   "url": "https://clearinghouse.fmcsa.dot.gov/FAQ/Topics/Queries",
   "publisher": "Federal Motor Carrier Safety Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_tm",
   "title": "Keeping your registration alive",
   "url": "https://www.uspto.gov/trademarks/maintain/keeping-your-registration-alive",
   "publisher": "United States Patent and Trademark Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_patent",
   "title": "Maintain your patent",
   "url": "https://www.uspto.gov/patents/maintain",
   "publisher": "United States Patent and Trademark Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_dmca",
   "title": "DMCA Designated Agent Directory: Frequently Asked Questions",
   "url": "https://www.copyright.gov/dmca-directory/faq.html",
   "publisher": "U.S. Copyright Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_fda_food",
   "title": "FDA Reminds Food Facilities of Biennial Renewal Requirements",
   "url": "https://www.fda.gov/food/hfp-constituent-updates/fda-reminds-food-facilities-biennial-renewal-requirements",
   "publisher": "U.S. Food and Drug Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_sam",
   "title": "Entity Registration",
   "url": "https://sam.gov/content/entity-registration",
   "publisher": "SAM.gov (U.S. General Services Administration)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_src_vets",
   "title": "VETS-4212 Federal Contractor Reporting",
   "url": "https://www.dol.gov/agencies/vets/programs/vets4212",
   "publisher": "Veterans' Employment and Training Service, U.S. Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ak_newhire_src",
   "title": "Employer Guide to New Hire Reporting (04-6610 Rev 09/25)",
   "url": "https://childsupport.alaska.gov/docs/childsupportserviceslibraries/brochures/04-6610-employer-guide-to-reporting-09-2025.pdf?sfvrsn=6aca121d_2",
   "publisher": "Alaska Department of Revenue, Child Support Services Division",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ak_uiwage_src",
   "title": "Alaska Employer Handbook: Unemployment Insurance Tax (last updated April 2024)",
   "url": "https://labor.alaska.gov/estax/documents/taxbook.pdf",
   "publisher": "Alaska Department of Labor and Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ak_unclaimed_src",
   "title": "Reporting Unclaimed Property Overview",
   "url": "https://treasury.dor.alaska.gov/Portals/0/docs/unclaimed%20property/Holder%20Reporting%20Overview.pdf",
   "publisher": "Alaska Department of Revenue, Treasury Division",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_al_newhire_src",
   "title": "New Hires - Workforce Alabama",
   "url": "https://workforce.alabama.gov/employers/new-hires/",
   "publisher": "Alabama Department of Workforce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_al_uiwage_src",
   "title": "Employers / FAQ - Workforce Alabama",
   "url": "https://workforce.alabama.gov/employers/faq/",
   "publisher": "Alabama Department of Workforce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_al_unclaimed_src",
   "title": "Instructions for Business Reporting and Remitting of Unclaimed Property",
   "url": "https://treasury.alabama.gov/wp-content/uploads/2024/07/Reporting-Instructions-10-25-16-update.pdf",
   "publisher": "Office of the Alabama State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_al_breach_src",
   "title": "Alabama Data Breach Notification Act of 2018 (Code of Alabama 8-38-1 to 8-38-12)",
   "url": "https://acua.alabama.gov/PDF/law/AlabamaDataBreachNotificationAct.pdf",
   "publisher": "State of Alabama (text of the Alabama Legislature's code)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ar_newhire_src",
   "title": "Employer Resources - Arkansas Division of Reemployment",
   "url": "https://reemployment.arkansas.gov/employer-services/employer-resources/",
   "publisher": "Arkansas Division of Workforce Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ar_uiwage_src",
   "title": "Arkansas Employer Handbook (2022)",
   "url": "https://dws.arkansas.gov/wp-content/uploads/Employer_Handbook_20220811.pdf",
   "publisher": "Arkansas Division of Workforce Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ar_unclaimed_src",
   "title": "Report Unclaimed Property - AR Auditor",
   "url": "https://auditor.ar.gov/report-property/",
   "publisher": "Arkansas Auditor of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ar_breach_src",
   "title": "Security or Data Breach - Arkansas Attorney General",
   "url": "https://arkansasag.gov/divisions/public-protection/identity/security-or-data-breach/",
   "publisher": "Arkansas Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_az_newhire_src",
   "title": "A.R.S. 23-722.01: Employer reporting; new hire directory",
   "url": "https://www.azleg.gov/ars/23/00722-01.htm",
   "publisher": "Arizona State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_az_uiwage_src",
   "title": "A.R.S. 23-723: Penalties for failure to file timely or complete contribution and wage reports",
   "url": "https://www.azleg.gov/ars/23/00723.htm",
   "publisher": "Arizona State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_az_unclaimed_src",
   "title": "A.R.S. 44-307: Report of abandoned property",
   "url": "https://www.azleg.gov/ars/44/00307.htm",
   "publisher": "Arizona State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_az_breach_src",
   "title": "A.R.S. 18-552: Notification of security system breaches",
   "url": "https://www.azleg.gov/ars/18/00552.htm",
   "publisher": "Arizona State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_newhire_src",
   "title": "New Hire Reporting - EDD",
   "url": "https://edd.ca.gov/en/payroll_taxes/New_Hire_Reporting/",
   "publisher": "California Employment Development Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_uiwage_src",
   "title": "Payroll Tax Calendar (Due Dates) - EDD",
   "url": "https://edd.ca.gov/en/payroll_taxes/due_dates_calendar/",
   "publisher": "California Employment Development Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_unclaimed_src",
   "title": "Report Unclaimed Property - State Controller's Office",
   "url": "https://www.sco.ca.gov/upd_rptg.html",
   "publisher": "California State Controller's Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_breach_src",
   "title": "Data Security Breach Reporting - California Attorney General",
   "url": "https://oag.ca.gov/privacy/databreach/reporting",
   "publisher": "California Department of Justice, Office of the Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_paydata_src",
   "title": "Pay Data Reporting - California Civil Rights Department",
   "url": "https://calcivilrights.ca.gov/paydatareporting/",
   "publisher": "California Civil Rights Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ca_retire_src",
   "title": "Frequently Asked Questions - CalSavers",
   "url": "https://www.calsavers.com/home/frequently-asked-questions.html",
   "publisher": "CalSavers Retirement Savings Program",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_co_newhire_src",
   "title": "New Hire Reporting form (Rev. 2026)",
   "url": "https://newhire.state.co.us/downloads/CO_NH_reporting.pdf",
   "publisher": "Colorado State Directory of New Hires",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_co_uiwage_src",
   "title": "Wage Reporting - Colorado Department of Labor and Employment",
   "url": "https://cdle.colorado.gov/employers/unemployment-insurance-premiums/wage-reporting",
   "publisher": "Colorado Department of Labor and Employment",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_co_unclaimed_src",
   "title": "Holder Deadlines - Colorado Unclaimed Property",
   "url": "https://unclaimedproperty.colorado.gov/app/holder-deadlines",
   "publisher": "Colorado Department of the Treasury",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_co_breach_src",
   "title": "House Bill 18-1128, Session Laws 2018 ch. 266 (amending C.R.S. 6-1-716)",
   "url": "https://content.leg.colorado.gov/sites/default/files/documents/2018A/bills/sl/2018a_sl_266.pdf",
   "publisher": "Colorado General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ct_newhire_src",
   "title": "Employer's Guide to Unemployment Compensation (updated April 23, 2026)",
   "url": "https://portal.ct.gov/dol/-/media/dol/2022-new-design-system/about/divisions/unemployment-insurance-tax/updated-employer-guide-april-23-2026.pdf?rev=e419292e6d0046d1b1dd5c9845a90bca",
   "publisher": "Connecticut Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ct_uiwage_src",
   "title": "Employer's Guide to Unemployment Compensation (updated April 23, 2026)",
   "url": "https://portal.ct.gov/dol/-/media/dol/2022-new-design-system/about/divisions/unemployment-insurance-tax/updated-employer-guide-april-23-2026.pdf?rev=e419292e6d0046d1b1dd5c9845a90bca",
   "publisher": "Connecticut Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ct_unclaimed_src",
   "title": "Reporting Unclaimed Property: A Guide for Connecticut Businesses",
   "url": "https://portal.ct.gov/-/media/OTT/PDFs/holderbrochure.pdf",
   "publisher": "Connecticut Office of the State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ct_breach_src",
   "title": "Reporting a Data Breach - Connecticut Attorney General",
   "url": "https://portal.ct.gov/ag/sections/privacy/reporting-a-data-breach",
   "publisher": "Connecticut Office of the Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ct_pfml_src",
   "title": "Remit Contributions - CT Paid Leave",
   "url": "https://www.ctpaidleave.org/remit-contributions",
   "publisher": "Connecticut Paid Family and Medical Leave Insurance Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_dc_newhire_src",
   "title": "District of Columbia Directory of New Hires",
   "url": "https://oag.dc.gov/district-columbia-directory-new-hires",
   "publisher": "Office of the Attorney General for the District of Columbia",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_dc_uiwage_src",
   "title": "Reporting Questions - Department of Employment Services",
   "url": "https://does.dc.gov/service/reporting-questions",
   "publisher": "DC Department of Employment Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_dc_unclaimed_src",
   "title": "How to Report Unclaimed Property: Filing Deadlines and Extensions",
   "url": "https://cfo.dc.gov/page/how-report-unclaimed-property-filing-deadlines-and-extensions",
   "publisher": "DC Office of the Chief Financial Officer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_dc_breach_src",
   "title": "D.C. Code 28-3852: Notification of security breach",
   "url": "https://code.dccouncil.gov/us/dc/council/code/sections/28-3852",
   "publisher": "Council of the District of Columbia",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_dc_pfml_src",
   "title": "Notice of Final Rulemaking: 7 DCMR Chapter 34, Paid Leave Contributions",
   "url": "https://does.dc.gov/sites/default/files/dc/sites/does/publication/attachments/Employment%20Services%20Department%20of%20%207%20DCMR%20%20Ch.%2034%20%20Paid%20Leave%20Contributions.pdf",
   "publisher": "DC Department of Employment Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_de_newhire_src",
   "title": "For Employers - Division of Child Support Services",
   "url": "https://dhss.delaware.gov/dcss/division-of-child-support-services/employers/",
   "publisher": "Delaware Department of Health and Social Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_de_uiwage_src",
   "title": "Employer FAQs - Delaware Department of Labor",
   "url": "https://labor.delaware.gov/divisions/unemployment-insurance/employer-faqs/",
   "publisher": "Delaware Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_de_unclaimed_src",
   "title": "Delaware Code Title 12, Chapter 11, Subchapter II (sections 1144, 1148, 1183)",
   "url": "https://delcode.delaware.gov/title12/c011/sc02/index.html",
   "publisher": "Delaware General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_de_breach_src",
   "title": "Delaware Code Title 6, Chapter 12B: Computer Security Breaches",
   "url": "https://delcode.delaware.gov/title6/c012b/index.html",
   "publisher": "Delaware General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_de_pfml_src",
   "title": "Employers & TPAs Guide to Delaware Paid Leave",
   "url": "https://laborfiles.delaware.gov/main/pfl/Employer_and_TPAs_Guide_to_DPL.pdf",
   "publisher": "Delaware Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_fl_newhire_src",
   "title": "Florida Statutes 409.2576: State Directory of New Hires",
   "url": "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499%2F0409%2FSections%2F0409.2576.html",
   "publisher": "Florida Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_fl_unclaimed_src",
   "title": "Florida Statutes 717.117: Report of unclaimed property",
   "url": "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&Search_String=&URL=0700-0799%2F0717%2FSections%2F0717.117.html",
   "publisher": "Florida Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_fl_breach_src",
   "title": "Florida Statutes 501.171: Security of confidential personal information",
   "url": "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599%2F0501%2FSections%2F0501.171.html",
   "publisher": "Florida Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ga_breach_src",
   "title": "Getting notified following a data breach (Consumer Ed)",
   "url": "https://consumered.georgia.gov/ask-ed/2023-08-30/getting-notified-following-data-breach",
   "publisher": "Georgia Attorney General's Consumer Protection Division",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ga_newhire_src",
   "title": "Georgia State Directory of New Hires: FAQs",
   "url": "https://newhire-reporting.com/GA-Newhire/faq.aspx",
   "publisher": "Georgia Department of Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ga_uiwage_src",
   "title": "Unemployment Insurance Tax Reporting and Liability Information for Employers",
   "url": "https://dol.georgia.gov/document/unemployment-tax/unemployment-insurance-tax-reporting-and-liability-information-employers/download",
   "publisher": "Georgia Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ga_unclaimed_src",
   "title": "UCP Holders FAQs",
   "url": "https://dor.georgia.gov/ucp-holders-faqs",
   "publisher": "Georgia Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_hi_breach_src",
   "title": "Hawaii Revised Statutes §487N-2, Security breach of personal information; notice requirement",
   "url": "https://data.capitol.hawaii.gov/hrscurrent/Vol11_Ch0476-0490/HRS0487N/HRS_0487N-0002.htm",
   "publisher": "Hawaii State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_hi_newhire_src",
   "title": "Hawaii Revised Statutes §576D-16, Report of new hires to the agency",
   "url": "https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0576D/HRS_0576D-0016.htm",
   "publisher": "Hawaii State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_hi_uiwage_src",
   "title": "Handbook for Employers on Unemployment Insurance",
   "url": "https://labor.hawaii.gov/ui/test-handbook-for-employers/",
   "publisher": "Hawaii Department of Labor and Industrial Relations",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_hi_unclaimed_src",
   "title": "Holder Reporting Guidelines (revised January 2026)",
   "url": "https://budget.hawaii.gov/wp-content/uploads/2026/01/Holder-Reporting-Guidelines-Revised-January-2026.pdf",
   "publisher": "Hawaii Department of Budget and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ia_breach_src",
   "title": "Iowa Code 715C.2, Security breach — consumer notification — remedies",
   "url": "https://www.legis.iowa.gov/docs/code/715C.2.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ia_newhire_src",
   "title": "Iowa Code 2026, Section 252G.3, Employer reporting requirements — penalty",
   "url": "https://www.legis.iowa.gov/docs/code/252G.3.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ia_uiwage_src",
   "title": "Iowa Administrative Code 871-23.8, Due date of quarterly contribution and payroll",
   "url": "https://www.legis.iowa.gov/docs/iac/rule/02-05-2025.871.23.8.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ia_unclaimed_src",
   "title": "Iowa Code 556.11, Report of abandoned property",
   "url": "https://www.legis.iowa.gov/docs/code/556.11.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_id_breach_src",
   "title": "Idaho Code 28-51-105, Disclosure of breach of security of computerized personal information",
   "url": "https://legislature.idaho.gov/statutesrules/idstat/title28/t28ch51/sect28-51-105/",
   "publisher": "Idaho Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_id_newhire_src",
   "title": "Report new hires",
   "url": "https://www.labor.idaho.gov/businesses/report-new-hires/",
   "publisher": "Idaho Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_id_uiwage_src",
   "title": "Employer Handbook: Unemployment Insurance Tax Information",
   "url": "https://www.labor.idaho.gov/wp-content/uploads/publications/UI_TAX_Information.pdf",
   "publisher": "Idaho Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_id_unclaimed_src",
   "title": "Idaho Code 14-5-403, When report to be filed",
   "url": "https://legislature.idaho.gov/statutesrules/idstat/Title14/T14CH5/SECT14-5-403/",
   "publisher": "Idaho Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_il_breach_src",
   "title": "Data Breach",
   "url": "https://illinoisattorneygeneral.gov/consumer-protection/for-businesses/data-breach/",
   "publisher": "Illinois Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_il_newhire_src",
   "title": "Illinois New Hire Reporting",
   "url": "https://newhire.hfs.illinois.gov/NewHireWeb/NewHireReporting.jsp",
   "publisher": "Illinois Department of Healthcare and Family Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_il_uiwage_src",
   "title": "Quarterly Filing Requirements",
   "url": "https://ides.illinois.gov/employer-resources/taxes-reporting/quarterly-filing-requirements.html",
   "publisher": "Illinois Department of Employment Security",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_il_unclaimed_src",
   "title": "Illinois Unclaimed Property: Reporting Guidelines",
   "url": "https://icash.illinoistreasurer.gov/app/reporting-guidelines",
   "publisher": "Illinois State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_in_breach_src",
   "title": "Security Breach FAQs & Notification Form for Businesses",
   "url": "https://secure.in.gov/attorneygeneral/consumer-protection-division/id-theft-prevention/security-breaches/security-breach-faqs-and-notification-form-for-businesses/",
   "publisher": "Indiana Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_in_newhire_src",
   "title": "Indiana New Hire Reporting brochure",
   "url": "https://www.in-newhire.com/files/INNewhireBrochure.pdf",
   "publisher": "Indiana Department of Workforce Development (Indiana New Hire Reporting Center)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_in_uiwage_src",
   "title": "Quarterly Report Due Dates",
   "url": "https://www.in.gov/dwd/indiana-unemployment/employers/employer-guide/wage-reporting-need-to-know/quarterly-report-due-dates",
   "publisher": "Indiana Department of Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_in_unclaimed_src",
   "title": "Indiana Unclaimed Property (Office of the Indiana Attorney General presentation, 6/1/2016)",
   "url": "https://secure.in.gov/sboa/files/Mayes_Unclaimed_Property.pdf",
   "publisher": "Office of the Indiana Attorney General (hosted by the Indiana State Board of Accounts)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ks_breach_src",
   "title": "K.S.A. 50-7a02, Security breach; requirements",
   "url": "https://www.ksrevisor.gov/statutes/chapters/ch50/050_007a_0002.html",
   "publisher": "Kansas Office of Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ks_newhire_src",
   "title": "Kansas Statutes 75-5743, Report of new employees",
   "url": "https://www.ksrevisor.gov/statutes/chapters/ch75/075_057_0043.html",
   "publisher": "Kansas Office of Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ks_uiwage_src",
   "title": "K.S.A. 44-717, Collection of employer payments; penalties and interest",
   "url": "https://www.ksrevisor.gov/statutes/chapters/ch44/044_007_0017.html",
   "publisher": "Kansas Office of Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ks_unclaimed_src",
   "title": "K.S.A. 58-3950, Report of abandoned property",
   "url": "https://ksrevisor.gov/statutes/chapters/ch58/058_039_0050.html",
   "publisher": "Kansas Office of Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ky_breach_src",
   "title": "KRS 365.732, Notification to affected persons of computer security breach",
   "url": "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=43326",
   "publisher": "Kentucky General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ky_newhire_src",
   "title": "KRS 405.435, Information from employers and labor organizations upon hiring of Kentucky residents",
   "url": "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54384",
   "publisher": "Kentucky General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ky_uiwage_src",
   "title": "Penalty and Interest Information",
   "url": "https://ui.ky.gov/Redesign/ResourcePages/PenaltyAndInterest.aspx",
   "publisher": "Kentucky Office of Unemployment Insurance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ky_unclaimed_src",
   "title": "20 KAR 1:080, Unclaimed property reporting",
   "url": "https://apps.legislature.ky.gov/law/kar/titles/020/001/080/",
   "publisher": "Kentucky General Assembly (Kentucky Administrative Regulations)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_la_breach_src",
   "title": "La. R.S. 51:3074, Protection of personal information; disclosure upon breach",
   "url": "https://legis.la.gov/legis/LawPrint.aspx?d=322030",
   "publisher": "Louisiana State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_la_newhire_src",
   "title": "Louisiana Directory of New Hires Employer Guide",
   "url": "https://www.la-newhire.com/files/LANewhireBrochure.pdf",
   "publisher": "Louisiana Directory of New Hires",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_la_uiwage_src",
   "title": "Unemployment Insurance - Wage & Tax Reporting Services",
   "url": "https://www.laworks.net/UnemploymentInsurance/UI_WageTaxReportingOverview.asp",
   "publisher": "Louisiana Works (Louisiana Workforce Commission)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_la_unclaimed_src",
   "title": "Louisiana Holder Reporting Process",
   "url": "https://www.treasury.la.gov/_files/ugd/4e639b_72e41c6d8ba84bc8a7ce576800b46788.pdf",
   "publisher": "Louisiana Department of the Treasury",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_me_breach_src",
   "title": "Maine Revised Statutes Title 10, §1348: Security breach notification",
   "url": "https://legislature.maine.gov/statutes/10/title10sec1348.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_me_newhire_src",
   "title": "Maine Revised Statutes Title 19-A, §2154: Employment information",
   "url": "https://legislature.maine.gov/statutes/19-A/title19-Asec2154.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_me_pfml_src",
   "title": "Maine Revised Statutes Title 26, §850-F: Premiums",
   "url": "https://legislature.maine.gov/statutes/26/title26sec850-F.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_me_uiwage_src",
   "title": "Maine Revised Statutes Title 26, §1082: Powers and duties of commissioner (subsection 13)",
   "url": "https://legislature.maine.gov/statutes/26/title26sec1082.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_me_unclaimed_src",
   "title": "Maine Revised Statutes Title 33, §2093: When report filed",
   "url": "https://legislature.maine.gov/statutes/33/title33sec2093.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ma_breach_src",
   "title": "Requirements for Data Breach Notifications",
   "url": "https://www.mass.gov/info-details/requirements-for-data-breach-notifications",
   "publisher": "Massachusetts Office of Consumer Affairs and Business Regulation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ma_newhire_src",
   "title": "Report New Hires",
   "url": "https://www.mass.gov/how-to/report-new-hires",
   "publisher": "Massachusetts Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ma_pfml_src",
   "title": "830 CMR 175M.8.1: Administration and Collection of Paid Family and Medical Leave Contributions",
   "url": "https://www.mass.gov/regulations/830-CMR-175m81-administration-and-collection-of-paid-family-and-medical-leave-contributions",
   "publisher": "Massachusetts Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ma_uiwage_src",
   "title": "Employer contributions to unemployment",
   "url": "https://www.mass.gov/info-details/employer-contributions-to-unemployment",
   "publisher": "Massachusetts Department of Unemployment Assistance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ma_unclaimed_src",
   "title": "Report unclaimed property",
   "url": "https://www.mass.gov/how-to/report-unclaimed-property",
   "publisher": "Massachusetts State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_md_breach_src",
   "title": "Commercial Law §14-3504",
   "url": "https://mgaleg.maryland.gov/2026RS/Statute_Web/gcl/14-3504.pdf",
   "publisher": "Maryland General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_md_newhire_src",
   "title": "Report New Hires",
   "url": "https://dhs.maryland.gov/child-support-services/report-new-hires/",
   "publisher": "Maryland Department of Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_md_pfml_src",
   "title": "Submit quarterly reports",
   "url": "https://paidleave.maryland.gov/employers/submit-quarterly-reports/",
   "publisher": "Maryland Department of Labor (FAMLI)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_md_uiwage_src",
   "title": "Delinquency Notice and Assessment Notice & Pending Civil Action Letter",
   "url": "https://labor.maryland.gov/unemployment-insurance/employer-agent/assessment-notice-civil-action-letter.shtml",
   "publisher": "Maryland Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_md_unclaimed_src",
   "title": "Holder Reporting Guidelines",
   "url": "https://www.claimitmd.gov/app/reporting-guidelines",
   "publisher": "Comptroller of Maryland",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mi_breach_src",
   "title": "MCL 445.72, Identity Theft Protection Act: notice of security breach",
   "url": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-445-72",
   "publisher": "Michigan Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mi_newhire_src",
   "title": "42 U.S.C. 653a, National Directory of New Hires (State Directory of New Hires)",
   "url": "https://www.govinfo.gov/content/pkg/USCODE-2023-title42/html/USCODE-2023-title42-chap7-subchapIV-partD-sec653a.htm",
   "publisher": "U.S. Government Publishing Office (United States Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mi_uiwage_src",
   "title": "Michigan Administrative Code R 421.1 to R 421.302 (Unemployment Insurance Agency, employment security), Rule 121",
   "url": "https://ars.apps.lara.state.mi.us/AdminCode/DownloadAdminCodeFile?FileName=R%20421.1%20to%20R%20421.302.pdf",
   "publisher": "Michigan Office of Administrative Hearings and Rules",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mi_unclaimed_src",
   "title": "MCL 567.238, Uniform Unclaimed Property Act: report",
   "url": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-567-238",
   "publisher": "Michigan Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mn_breach_src",
   "title": "Minnesota Statutes 325E.61, Data warehouses; notice required for certain disclosures",
   "url": "https://www.revisor.mn.gov/statutes/cite/325E.61",
   "publisher": "Minnesota Office of the Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mn_newhire_src",
   "title": "Minnesota Statutes 142A.29, Employer new hire reporting program",
   "url": "https://www.revisor.mn.gov/statutes/cite/142A.29",
   "publisher": "Minnesota Office of the Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mn_pfml_src",
   "title": "Minnesota Statutes 268B.12, Wage detail reporting",
   "url": "https://www.revisor.mn.gov/statutes/cite/268B.12",
   "publisher": "Minnesota Office of the Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mn_uiwage_src",
   "title": "Employer Handbook: Reports and Payments (fees and penalties)",
   "url": "https://mn.gov/uimn/employers/publications/emp-hbook/fees-penalties.jsp",
   "publisher": "Minnesota Unemployment Insurance Program (DEED)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mn_unclaimed_src",
   "title": "Unclaimed Property Program Holder Reporting Guide 2026",
   "url": "https://mn.gov/commerce-stat/pdfs/2026-Holder-Reporting-Guide.pdf",
   "publisher": "Minnesota Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mo_breach_src",
   "title": "RSMo 407.1500, notice to consumer for breach of security",
   "url": "https://revisor.mo.gov/main/OneSection.aspx?section=407.1500",
   "publisher": "Missouri Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mo_newhire_src",
   "title": "New Hire Reporting: Frequently Asked Questions",
   "url": "https://www.missouriemployer.dss.mo.gov/Help/FAQs.htm",
   "publisher": "Missouri Department of Social Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mo_uiwage_src",
   "title": "Quarterly Reports",
   "url": "https://labor.mo.gov/des/employers/quarterly-reports",
   "publisher": "Missouri Division of Employment Security",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mo_unclaimed_src",
   "title": "Reporting Unclaimed Property",
   "url": "https://treasurer.mo.gov/UCP/ReportingUnclaimedProperty.aspx",
   "publisher": "Missouri State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ms_breach_src",
   "title": "Senate Bill 2128 (2026), as introduced, reprinting Section 75-24-29",
   "url": "https://billstatus.ls.state.ms.us/documents/2026/html/SB/2100-2199/SB2128IN.htm",
   "publisher": "Mississippi Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ms_newhire_src",
   "title": "For Employers (Child Support)",
   "url": "https://www.mdhs.ms.gov/childsupport/employers/",
   "publisher": "Mississippi Department of Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ms_uiwage_src",
   "title": "Quarterly Report and Tax Due Dates",
   "url": "https://mdes.ms.gov/employers/unemployment-tax/reporting-and-filing/quarterly-report-and-tax-due-dates/",
   "publisher": "Mississippi Department of Employment Security",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ms_unclaimed_src",
   "title": "Instructions for Mississippi Unclaimed Property Holder Reporting",
   "url": "https://treasury.ms.gov/wp-content/uploads/2020/06/Holder-Reporting-Instructions.pdf",
   "publisher": "Mississippi State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mt_breach_src",
   "title": "MCA 30-14-1704, Computer security breach",
   "url": "https://mca.legmt.gov/bills/mca/title_0300/chapter_0140/part_0170/section_0040/0300-0140-0170-0040.html",
   "publisher": "Montana Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mt_newhire_src",
   "title": "New Hire Reporting Program",
   "url": "https://dphhs.mt.gov/cssd/employerinfo/newhirereporting",
   "publisher": "Montana Department of Public Health and Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mt_uiwage_src",
   "title": "Employer Handbook",
   "url": "https://uid.dli.mt.gov/employer-handbook.pdf",
   "publisher": "Montana Department of Labor and Industry",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_mt_unclaimed_src",
   "title": "Montana Unclaimed Property Reporting",
   "url": "https://revenue.mt.gov/unclaimed-property/report",
   "publisher": "Montana Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ne_breach_src",
   "title": "Neb. Rev. Stat. 87-803, Breach of security; notice to resident; notice to Attorney General",
   "url": "https://nebraskalegislature.gov/laws/statutes.php?statute=87-803",
   "publisher": "Nebraska Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ne_newhire_src",
   "title": "New Hire Reporting for Employers",
   "url": "https://dhhs.ne.gov/Pages/Child-Support-Employer-New-Hire.aspx",
   "publisher": "Nebraska Department of Health and Human Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ne_uiwage_src",
   "title": "Unemployment Tax Account Instructions (revised 10/2/2024)",
   "url": "https://dol.nebraska.gov/webdocs/Resources/Items/1_UI%20Tax%20Account%20Instruction%20guide.pdf",
   "publisher": "Nebraska Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ne_unclaimed_src",
   "title": "Neb. Rev. Stat. 69-1310, reports to State Treasurer",
   "url": "https://nebraskalegislature.gov/laws/statutes.php?statute=69-1310",
   "publisher": "Nebraska Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nh_breach_src",
   "title": "RSA 359-C:20, Notice of security breach",
   "url": "https://gc.nh.gov/rsa/html/XXXI/359-C/359-C-20.htm",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nh_newhire_src",
   "title": "RSA 282-A:117-a, Employment reports to Department of Employment Security; State Directory of New Hires",
   "url": "https://gc.nh.gov/rsa/html/XXIII/282-A/282-A-117-a.htm",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nh_uiwage_src",
   "title": "Emp 100-500, Employment Security rules",
   "url": "https://www.gc.nh.gov/rules/state_agencies/emp100-500.html",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nh_unclaimed_src",
   "title": "RSA 471-C:19, Report of abandoned property",
   "url": "https://gc.nh.gov/rsa/html/XLVI/471-C/471-C-19.htm",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nv_breach_src",
   "title": "NRS chapter 603A, NRS 603A.220 Disclosure of breach of security of system data",
   "url": "https://www.leg.state.nv.us/NRS/NRS-603A.html",
   "publisher": "Nevada Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nv_newhire_src",
   "title": "1.1.7.01 New Hire Reporting",
   "url": "https://www.dss.nv.gov/programs/child-support/1-1-7-01-new-hire-reporting/",
   "publisher": "Nevada Division of Welfare and Supportive Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nv_uiwage_src",
   "title": "NAC chapter 612, NAC 612.260 Contributions by employers",
   "url": "https://www.leg.state.nv.us/NAC/NAC-612.html",
   "publisher": "Nevada Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nv_unclaimed_src",
   "title": "NRS chapter 120A, Unclaimed Property",
   "url": "https://www.leg.state.nv.us/NRS/NRS-120A.html",
   "publisher": "Nevada Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nj_breach_src",
   "title": "P.L.2019, Chapter 95: disclosure of breaches of security",
   "url": "https://pub.njleg.gov/bills/2018/PL19/95_.PDF",
   "publisher": "New Jersey Legislature (P.L.2019, c.95, amending N.J.S.A. 56:8-163)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nm_breach_src",
   "title": "HB 15 (2017) Data Breach Notification Act, final text",
   "url": "https://www.nmlegis.gov/Sessions/17%20Regular/final/HB0015.PDF",
   "publisher": "New Mexico Legislature (HB 15, 2017, Data Breach Notification Act)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ny_breach_src",
   "title": "General Business Law § 899-AA Notification; person without valid authorization has acquired private information",
   "url": "https://www.nysenate.gov/legislation/laws/GBS/899-AA",
   "publisher": "New York State Senate (General Business Law § 899-aa)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nc_breach_src",
   "title": "G.S. 75-65 Protection from security breaches",
   "url": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_75/GS_75-65.html",
   "publisher": "North Carolina General Assembly (G.S. 75-65)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nd_breach_src",
   "title": "Chapter 51-30 Notice of Security Breach for Personal Information",
   "url": "https://ndlegis.gov/cencode/t51c30.pdf",
   "publisher": "North Dakota Legislative Branch (N.D.C.C. ch. 51-30)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_oh_breach_src",
   "title": "Section 1349.19 Private disclosure of security breach of computerized personal information data",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-1349.19",
   "publisher": "Ohio Legislative Service Commission (Ohio Revised Code 1349.19)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ok_breach_src",
   "title": "Enrolled SB 626 Security Breach Notification Act (effective January 1, 2026)",
   "url": "https://www.oklegislature.gov/cf_pdf/2025-26%20ENR/SB/SB626%20ENR.PDF",
   "publisher": "Oklahoma Legislature (SB 626, 2025, Security Breach Notification Act)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_or_breach_src",
   "title": "ORS Chapter 646A (ORS 646A.604 Notice of breach of security)",
   "url": "https://www.oregonlegislature.gov/bills_laws/ors/ors646A.html",
   "publisher": "Oregon State Legislature (ORS 646A.604)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_pa_breach_src",
   "title": "Breach of Personal Information Notification Act (BPINA)",
   "url": "https://www.attorneygeneral.gov/report-a-data-breach/bpina/",
   "publisher": "Pennsylvania Office of Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ri_breach_src",
   "title": "R.I. Gen. Laws § 11-49.3-4 Notification of breach",
   "url": "https://webserver.rilegislature.gov/Statutes/TITLE11/11-49.3/11-49.3-4.htm",
   "publisher": "Rhode Island General Assembly (R.I. Gen. Laws § 11-49.3-4)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nj_newhire_src",
   "title": "Reporting Fundamentals - New Jersey Child Support Employer Services Portal",
   "url": "https://www.njcsesp.com/reporting_fundamentals",
   "publisher": "New Jersey Child Support Employer Services Portal (NJ Division of Family Development)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nm_newhire_src",
   "title": "Employers overview - New Mexico Health Care Authority",
   "url": "https://www.hca.nm.gov/lookingforassistance/employers-overview/",
   "publisher": "New Mexico Health Care Authority",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ny_newhire_src",
   "title": "New hire reporting",
   "url": "https://www.tax.ny.gov/bus/wt/newhire.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nc_newhire_src",
   "title": "G.S. 110-129.2 State Directory of New Hires",
   "url": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_110/GS_110-129.2.html",
   "publisher": "North Carolina General Assembly (G.S. 110-129.2)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nd_newhire_src",
   "title": "New hire reporting requirements",
   "url": "https://www.hhs.nd.gov/childsupport/employers/new-hire-reporting/reporting-requirements",
   "publisher": "North Dakota Health and Human Services, Child Support",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_oh_newhire_src",
   "title": "Section 3121.893 Methods for making new hire report",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-3121.893",
   "publisher": "Ohio Legislative Service Commission (Ohio Revised Code 3121.893)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ok_newhire_src",
   "title": "New Hire Reporting",
   "url": "https://oklahoma.gov/oesc/employers/new-hire-reporting.html",
   "publisher": "Oklahoma Employment Security Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_or_newhire_src",
   "title": "Report New Hires",
   "url": "https://www.doj.state.or.us/child-support/for-employers/report-new-hires/",
   "publisher": "Oregon Department of Justice, Child Support Program",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_pa_newhire_src",
   "title": "PA CareerLink - Report New Hires",
   "url": "https://www.pacareerlink.pa.gov/jponline/Common/LandingPage/ReportNewHires",
   "publisher": "Pennsylvania Department of Labor & Industry (PA CareerLink)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ri_newhire_src",
   "title": "Reporting Fundamentals - Rhode Island New Hire Reporting Directory",
   "url": "https://www.ri-newhire.com/reporting_fundamentals",
   "publisher": "Rhode Island New Hire Reporting Directory (Office of Child Support Services)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nj_retire_src",
   "title": "RetireReady NJ - Employer program details",
   "url": "https://www.nj.gov/treasury/securechoiceprogram/employers/employer-program-details.shtml",
   "publisher": "New Jersey Department of the Treasury, RetireReady NJ",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nj_uiwage_src",
   "title": "Employer handbook: taxes and wages",
   "url": "https://www.nj.gov/labor/ea/help/employer_handbook/taxes_wages.shtml",
   "publisher": "New Jersey Department of Labor and Workforce Development, Division of Employer Accounts",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nm_uiwage_src",
   "title": "11.3.400 NMAC Unemployment Insurance Tax",
   "url": "https://www.srca.nm.gov/parts/title11/11.003.0400.html",
   "publisher": "New Mexico State Records Center and Archives (11.3.400 NMAC)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ny_uiwage_src",
   "title": "NYS-45 Quarterly Reporting",
   "url": "https://dol.ny.gov/nys-45-quarterly-reporting",
   "publisher": "New York State Department of Labor",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nc_uiwage_src",
   "title": "Employer Tax FAQs",
   "url": "https://www.des.nc.gov/need-help/faqs/employer-tax-faqs",
   "publisher": "North Carolina Division of Employment Security",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nd_uiwage_src",
   "title": "Employer's Handbook for the Unemployment Insurance Program in North Dakota (2024)",
   "url": "https://www.jobsnd.com/sites/www/files/documents/jsnd-documents/uiemployershandbookjsnd40362024.pdf",
   "publisher": "Job Service North Dakota",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_oh_uiwage_src",
   "title": "Section 4141.20 Employers to furnish information to director - quarterly reports - forfeiture",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-4141.20",
   "publisher": "Ohio Legislative Service Commission (Ohio Revised Code 4141.20)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ok_uiwage_src",
   "title": "Title 240 Oklahoma Employment Security Commission rules (effective 8.12.24)",
   "url": "https://oklahoma.gov/content/dam/ok/en/oesc/documents/policies/Title_240%20-%20effective%208.12.24.pdf",
   "publisher": "Oklahoma Employment Security Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_or_uiwage_src",
   "title": "2026 Oregon Combined Payroll Tax Report Instructions",
   "url": "https://www.oregon.gov/dor/forms/FormsPubs/combined-payroll_211-155-2_2026.pdf",
   "publisher": "Oregon Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_pa_uiwage_src",
   "title": "File Unemployment Compensation Quarterly Wage/Tax Reports",
   "url": "https://www.pa.gov/services/dli/file-unemployment-compensation-quarterly-wage-tax-reports",
   "publisher": "Pennsylvania Department of Labor & Industry",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ri_uiwage_src",
   "title": "Pay Your Business Taxes",
   "url": "https://www.sos.ri.gov/divisions/business-services/ri-business/pay-your-business-taxes",
   "publisher": "Rhode Island Department of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nj_unclaimed_src",
   "title": "Unclaimed Property Administration - Business FAQs",
   "url": "https://www.nj.gov/treasury/unclaimed-property/BusinessFAQs.shtml",
   "publisher": "New Jersey Department of the Treasury, Unclaimed Property Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nm_unclaimed_src",
   "title": "RPD-41200 Holder's Filing Kit (02/27/2024)",
   "url": "https://www.tax.newmexico.gov/individuals/wp-content/uploads/sites/5/2024/02/rpd-41200.pdf",
   "publisher": "New Mexico Taxation and Revenue Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ny_unclaimed_src",
   "title": "Unclaimed Property Relating to All Business Entities - Reference Sheet",
   "url": "https://www.osc.ny.gov/files/unclaimed-funds/reporters/pdf/general-corporations.pdf",
   "publisher": "Office of the New York State Comptroller, Office of Unclaimed Funds",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nc_unclaimed_src",
   "title": "Holder Frequently Asked Questions",
   "url": "https://www.nccash.gov/faqs/holder-frequently-asked-questions",
   "publisher": "North Carolina Department of State Treasurer (NCCash)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_nd_unclaimed_src",
   "title": "Chapter 47-30.2 Revised Uniform Unclaimed Property Act",
   "url": "https://ndlegis.gov/cencode/t47c30-2.pdf",
   "publisher": "North Dakota Legislative Branch (N.D.C.C. ch. 47-30.2)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_oh_unclaimed_src",
   "title": "Section 169.03 Report of unclaimed funds",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-169.03",
   "publisher": "Ohio Legislative Service Commission (Ohio Revised Code 169.03)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ok_unclaimed_src",
   "title": "Holder Information",
   "url": "https://oklahoma.gov/treasurer/unclaimed-property/holder-information.html",
   "publisher": "Oklahoma State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_or_unclaimed_src",
   "title": "ORS Chapter 98 (ORS 98.352)",
   "url": "https://www.oregonlegislature.gov/bills_laws/ors/ors098.html",
   "publisher": "Oregon State Legislature (ORS chapter 98)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_pa_unclaimed_src",
   "title": "Pennsylvania Unclaimed Property Annual Reporting, 2025 Report Year",
   "url": "https://www.patreasury.gov/pdf/unclaimed-property/holder-reporting-book.pdf",
   "publisher": "Pennsylvania Treasury",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ri_unclaimed_src",
   "title": "R.I. Gen. Laws § 33-21.1-17 Report of abandoned property",
   "url": "https://webserver.rilegislature.gov/Statutes/TITLE33/33-21.1/33-21.1-17.HTM",
   "publisher": "Rhode Island General Assembly (R.I. Gen. Laws § 33-21.1-17)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sc_newhire_src",
   "title": "South Carolina Code of Laws, Title 43, Chapter 5, Section 43-5-598 (new hire directory)",
   "url": "https://www.scstatehouse.gov/code/t43c005.php",
   "publisher": "South Carolina Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sc_uiwage_src",
   "title": "Unemployment Insurance Employer Handbook (as of October 2026)",
   "url": "https://dew.sc.gov/sites/dew/files/Documents/Employer%20Handbook_As%20of%2010.2026.pdf",
   "publisher": "South Carolina Department of Employment and Workforce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sc_unclaimed_src",
   "title": "Reporting Unclaimed Property: Frequently Asked Questions",
   "url": "https://treasurer.sc.gov/media/evvprcct/reporting-unclaimed-property-frequently-asked-questions.pdf",
   "publisher": "South Carolina Office of the State Treasurer",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sc_breach_src",
   "title": "South Carolina Code of Laws, Title 39, Chapter 1, Section 39-1-90 (breach of security of business data)",
   "url": "https://www.scstatehouse.gov/code/t39c001.php",
   "publisher": "South Carolina Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sd_newhire_src",
   "title": "New Hire Reporting - Reporting Requirements",
   "url": "https://dlr.sd.gov/ra/new_hire_reporting/reporting_requirements.aspx",
   "publisher": "South Dakota Department of Labor and Regulation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sd_uiwage_src",
   "title": "Reemployment Assistance Tax - Wage Reporting",
   "url": "https://dlr.sd.gov/ra/businesses/wage_reporting.aspx",
   "publisher": "South Dakota Department of Labor and Regulation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sd_unclaimed_src",
   "title": "South Dakota Codified Law 43-41B-18 (report of abandoned property)",
   "url": "https://sdlegislature.gov/Statutes/43-41B-18",
   "publisher": "South Dakota Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_sd_breach_src",
   "title": "South Dakota Codified Law 22-40-20 (notice of breach of system security)",
   "url": "https://sdlegislature.gov/Statutes/22-40-20",
   "publisher": "South Dakota Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tn_newhire_src",
   "title": "New Hire Reporting",
   "url": "https://www.tn.gov/workforce/employers/staffing-redirect/hiring-regulations/new-hire-reporting.html",
   "publisher": "Tennessee Department of Labor and Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tn_uiwage_src",
   "title": "Unemployment Insurance Tax",
   "url": "https://www.tn.gov/workforce/employers/tax-and-insurance-redirect/unemployment-insurance-tax.html",
   "publisher": "Tennessee Department of Labor and Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tn_unclaimed_src2",
   "title": "Uniform Disposition of Unclaimed Property Act Reporting Instructions (Complete Reporting Guide)",
   "url": "https://treasury.tn.gov/Portals/0/Documents/Unclaimed%20Property/Reporting/TNReporting-CompleteReportingGuide.pdf",
   "publisher": "Tennessee Department of Treasury, Unclaimed Property Division",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tn_breach_src",
   "title": "Consumer Laws",
   "url": "https://www.tn.gov/attorneygeneral/working-for-tennessee/consumer/resources/laws.html",
   "publisher": "Tennessee Attorney General",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tx_newhire_src",
   "title": "New Hire Reporting",
   "url": "https://www.texasattorneygeneral.gov/child-support/employers/new-hire-reporting",
   "publisher": "Office of the Attorney General of Texas, Child Support Division",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tx_uiwage_src",
   "title": "Tax Report & Payment Due Dates",
   "url": "https://www.twc.texas.gov/programs/unemployment-tax/tax-report-payment-due-dates",
   "publisher": "Texas Workforce Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tx_unclaimed_src",
   "title": "Unclaimed Property 2026 Reporting Instructions (96-478)",
   "url": "https://www.claimittexas.gov/docs/96-478.pdf",
   "publisher": "Texas Comptroller of Public Accounts",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_tx_breach_src",
   "title": "Data Breach Reporting",
   "url": "https://www.texasattorneygeneral.gov/consumer-protection/data-breach-reporting",
   "publisher": "Office of the Attorney General of Texas",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ut_newhire_src",
   "title": "New Hire Reporting Requirements",
   "url": "https://jobs.utah.gov/ui/employer/Public/Newhire/NewHireReportRequirements.aspx",
   "publisher": "Utah Department of Workforce Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ut_uiwage_src",
   "title": "What is the Quarterly Reporting Schedule? (Quarterly Reporting)",
   "url": "https://jobs.utah.gov/UI/Employer/Public/Questions/QuarterlyReporting.aspx",
   "publisher": "Utah Department of Workforce Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ut_unclaimed_src",
   "title": "Utah Code 67-4a-403 (when report to be filed)",
   "url": "https://le.utah.gov/xcode/Title67/Chapter4A/67-4a-S403.html",
   "publisher": "Utah State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_ut_breach_src",
   "title": "Utah Code 13-44-202 (disclosure of system security breach)",
   "url": "https://le.utah.gov/xcode/Title13/Chapter44/13-44-S202.html",
   "publisher": "Utah State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_va_newhire_src",
   "title": "Reporting New Hires in Virginia",
   "url": "https://www.dss.virginia.gov/empowering-families/employer-resources/reporting-new-hires-in-virginia/",
   "publisher": "Virginia Department of Social Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_va_uiwage_src",
   "title": "Is there any penalty for filing my quarterly report late? And what if the due date falls on a weekend or holiday?",
   "url": "https://vec.virginia.gov/FAQs/employers/there-any-penalty-filing-my-quarterly-report-late-and-what-if-due-data-falls-weekend",
   "publisher": "Virginia Employment Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_va_unclaimed_src",
   "title": "Code of Virginia § 55.1-2524 (report and remittance by holder; due diligence)",
   "url": "https://law.lis.virginia.gov/vacode/title55.1/chapter25/section55.1-2524/",
   "publisher": "Virginia General Assembly (Legislative Information System)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_va_breach_src",
   "title": "Code of Virginia § 18.2-186.6 (breach of personal information notification)",
   "url": "https://law.lis.virginia.gov/vacode/title18.2/chapter6/section18.2-186.6/",
   "publisher": "Virginia General Assembly (Legislative Information System)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_va_retire_src",
   "title": "Code of Virginia chapter 27.1 of Title 2.2 (State-Facilitated IRA Savings Program)",
   "url": "https://law.lis.virginia.gov/vacodefull/title2.2/chapter27.1/",
   "publisher": "Virginia General Assembly (Legislative Information System)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_vt_newhire_src",
   "title": "33 V.S.A. § 4110 (employer obligations; new hire reporting)",
   "url": "https://legislature.vermont.gov/statutes/section/33/041/04110",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_vt_uiwage_src",
   "title": "21 V.S.A. § 1328 (filing employer quarterly tax contribution reports; failure)",
   "url": "https://legislature.vermont.gov/statutes/section/21/017/01328",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_vt_unclaimed_src",
   "title": "27 V.S.A. chapter 18 (Unclaimed Property), §§ 1493, 1501 and 1594",
   "url": "https://legislature.vermont.gov/statutes/fullchapter/27/018",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_vt_breach_src",
   "title": "9 V.S.A. § 2435 (notice of security breaches)",
   "url": "https://legislature.vermont.gov/statutes/section/09/062/02435",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wa_newhire_src",
   "title": "New Hire Reporting",
   "url": "https://www.dshs.wa.gov/family-food-and-housing-services/child-support/employer-resources/new-hire-reporting",
   "publisher": "Washington State Department of Social and Health Services, Division of Child Support",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wa_uiwage_src",
   "title": "How to file your quarterly tax and wage reports",
   "url": "https://esd.wa.gov/employer-requirements/quarterly-reports/how-file-your-quarterly-tax-and-wage-reports",
   "publisher": "Washington Employment Security Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wa_unclaimed_src",
   "title": "Unclaimed Property (UCP)",
   "url": "https://dor.wa.gov/about/unclaimed-property-ucp",
   "publisher": "Washington State Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wa_breach_src",
   "title": "RCW 19.255.010 (disclosure, notice; definitions; rights, remedies)",
   "url": "https://app.leg.wa.gov/rcw/default.aspx?cite=19.255.010",
   "publisher": "Washington State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wa_pfml_src",
   "title": "Chapter 192-540 WAC (Paid Family and Medical Leave: employer responsibilities), WAC 192-540-030 and 192-540-050",
   "url": "https://app.leg.wa.gov/wac/default.aspx?cite=192-540&full=true",
   "publisher": "Washington State Legislature (Washington Administrative Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wi_newhire_src",
   "title": "Wisconsin New Hire Reporting",
   "url": "https://dwd.wisconsin.gov/ui/employer/newhire",
   "publisher": "Wisconsin Department of Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wi_uiwage_src",
   "title": "Part 4 - Account Reporting, Section 2 - Tax, Unemployment Insurance Employer Handbook",
   "url": "https://dwd.wisconsin.gov/ui201/t4201",
   "publisher": "Wisconsin Department of Workforce Development",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wi_unclaimed_src",
   "title": "DOR Holders (Unclaimed Property FAQs)",
   "url": "https://www.revenue.wi.gov/Pages/FAQS/ucp-holders.aspx",
   "publisher": "Wisconsin Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wi_breach_src",
   "title": "Wisconsin's Data Breach Notification Law",
   "url": "https://datcp.wi.gov/Pages/Publications/IDTheftDataBreach607.aspx",
   "publisher": "Wisconsin Department of Agriculture, Trade and Consumer Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wv_newhire_src",
   "title": "West Virginia Code §48-18-125 (new hire reporting)",
   "url": "https://code.wvlegislature.gov/48-18-125/",
   "publisher": "West Virginia Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wv_uiwage_src",
   "title": "Tax Filing & Reporting",
   "url": "https://workforcewv.org/businesses/unemployment-tax-information/tax-filing-reporting/",
   "publisher": "WorkForce West Virginia",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wv_unclaimed_src",
   "title": "West Virginia Code §36-8-7 (report of abandoned property)",
   "url": "https://code.wvlegislature.gov/36-8-7/",
   "publisher": "West Virginia Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wv_breach_src",
   "title": "West Virginia Code §46A-2A-102 (notice of breach of security of computerized personal information)",
   "url": "https://code.wvlegislature.gov/46A-2A-102/",
   "publisher": "West Virginia Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wy_newhire_src",
   "title": "Wyoming Statutes Title 27 (Labor and Employment), W.S. 27-1-115 (state directory of new hires)",
   "url": "https://wyoleg.gov/statutes/compress/title27.pdf",
   "publisher": "Wyoming Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wy_uiwage_src",
   "title": "Reporting Due Dates",
   "url": "https://dws.wyo.gov/dws-division/unemployment-insurance/employers/reporting-due-dates/",
   "publisher": "Wyoming Department of Workforce Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wy_unclaimed_src",
   "title": "Unclaimed Property (holder reporting)",
   "url": "https://statetreasurer.wyo.gov/unclaimed-property/",
   "publisher": "Wyoming State Treasurer's Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_wy_breach_src",
   "title": "Wyoming Statutes Title 40, W.S. 40-12-502 (computer security breach; notice to affected persons)",
   "url": "https://wyoleg.gov/statutes/compress/title40.pdf",
   "publisher": "Wyoming Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1040gi",
   "title": "Instructions for Form 1040 (2025)",
   "url": "https://www.irs.gov/instructions/i1040gi",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1040nr",
   "title": "Instructions for Form 1040-NR (2025)",
   "url": "https://www.irs.gov/instructions/i1040nr",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_f1040sd",
   "title": "Schedule D (Form 1040) 2025",
   "url": "https://www.irs.gov/pub/irs-pdf/f1040sd.pdf",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_f1040se",
   "title": "Schedule E (Form 1040) 2025",
   "url": "https://www.irs.gov/pub/irs-pdf/f1040se.pdf",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1040sh",
   "title": "Instructions for Schedule H (Form 1040) (2025)",
   "url": "https://www.irs.gov/instructions/i1040sh",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i709",
   "title": "Instructions for Form 709 (2025)",
   "url": "https://www.irs.gov/instructions/i709",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc26_6651",
   "title": "26 U.S.C. 6651 - Failure to file tax return or to pay tax (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/26/6651?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1120f",
   "title": "Instructions for Form 1120-F (2025)",
   "url": "https://www.irs.gov/instructions/i1120f",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_iw8ben",
   "title": "Instructions for Form W-8BEN (10/2021)",
   "url": "https://www.irs.gov/instructions/iw8ben",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1041",
   "title": "Instructions for Form 1041 and Schedules A, B, G, J, and K-1 (2025)",
   "url": "https://www.irs.gov/instructions/i1041",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_irs_estind",
   "title": "Underpayment of estimated tax by individuals penalty",
   "url": "https://www.irs.gov/payments/underpayment-of-estimated-tax-by-individuals-penalty",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i706",
   "title": "Instructions for Form 706",
   "url": "https://www.irs.gov/instructions/i706",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i990t",
   "title": "Instructions for Form 990-T (2025)",
   "url": "https://www.irs.gov/instructions/i990t",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i1042",
   "title": "Instructions for Form 1042 (2025)",
   "url": "https://www.irs.gov/instructions/i1042",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_p15",
   "title": "Publication 15 (2026), (Circular E), Employer's Tax Guide",
   "url": "https://www.irs.gov/publications/p15",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_i109495c",
   "title": "Instructions for Forms 1094-C and 1095-C (2025)",
   "url": "https://www.irs.gov/instructions/i109495c",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc31_5336",
   "title": "31 U.S.C. 5336 - Beneficial ownership information reporting requirements (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/31/5336?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_31cfr1010_380",
   "title": "31 CFR 1010.380 - Reports of beneficial ownership information (eCFR, current; last amended August 14, 2026)",
   "url": "https://www.ecfr.gov/current/title-31/section-1010.380",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_29cfr1903_15",
   "title": "29 CFR 1903.15 - Proposed penalties (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-29/section-1903.15",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc42_653a",
   "title": "42 U.S.C. 653a - State Directory of New Hires (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/42/653a?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc29_216",
   "title": "29 U.S.C. 216 - Penalties (FLSA) (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/29/216?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_29cfr825_300",
   "title": "29 CFR 825.300 - Employer notice requirements (FMLA) (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-29/section-825.300",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc29_2104",
   "title": "29 U.S.C. 2104 - Administration and enforcement of requirements (WARN Act) (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/29/2104?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc42_2000e_8",
   "title": "42 U.S.C. 2000e-8 - Investigations (Title VII, section 709) (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/42/2000e-8?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc29_1132",
   "title": "29 U.S.C. 1132 - Civil enforcement (ERISA section 502) (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/29/1132?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_irs_fixit_deferrals",
   "title": "401(k) Plan Fix-It Guide - You haven't timely deposited employee elective deferrals",
   "url": "https://www.irs.gov/retirement-plans/401k-plan-fix-it-guide-you-havent-timely-deposited-employee-elective-deferrals",
   "publisher": "Internal Revenue Service",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_usc26_4980D",
   "title": "26 U.S.C. 4980D - Failure to meet certain group health plan requirements (United States Code, 2024 edition)",
   "url": "https://www.govinfo.gov/link/uscode/26/4980D?type=usc&year=mostrecent&link-type=html",
   "publisher": "U.S. Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_cms_creditable",
   "title": "Creditable Coverage (Medicare Part D)",
   "url": "https://www.cms.gov/medicare/employers-plan-sponsors/creditable-coverage",
   "publisher": "Centers for Medicare & Medicaid Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_45cfr102_3",
   "title": "45 CFR 102.3 - Penalty adjustment and table (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-45/section-102.3",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_16cfr436",
   "title": "16 CFR Part 436 - Disclosure requirements and prohibitions concerning franchising (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-16/part-436",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_17cfr230_507",
   "title": "17 CFR 230.507 - Disqualifying provision relating to exemptions under 230.504 and 230.506 (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-17/section-230.507",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_bea_fdius",
   "title": "International Surveys: Foreign Direct Investment in the United States",
   "url": "https://www.bea.gov/surveys/fdiusurv",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_bea_dia",
   "title": "International Surveys: U.S. Direct Investment Abroad",
   "url": "https://www.bea.gov/surveys/diasurv",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_bea_be15_instr",
   "title": "BE-15 Instruction Booklet (2025 annual survey)",
   "url": "https://www.bea.gov/sites/default/files/2026-02/BE-15-Instruction-Booklet.pdf",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_bea_be11_instr",
   "title": "BE-11 Instructions (2025 annual survey)",
   "url": "https://www.bea.gov/system/files/2026-02/be11_Instructions.pdf",
   "publisher": "Bureau of Economic Analysis, U.S. Department of Commerce",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_40cfr19_4",
   "title": "40 CFR 19.4 - Statutory civil monetary penalties, as adjusted for inflation, and tables (eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-40/section-19.4",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ecfr_49cfr386_appB",
   "title": "Appendix B to 49 CFR Part 386 - Penalty Schedule: Violations and Monetary Penalties (eCFR, current; last amended July 21, 2026)",
   "url": "https://www.ecfr.gov/current/title-49/part-386/appendix-Appendix%20B%20to%20Part%20386",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_ucr_enforcement",
   "title": "How is UCR Enforced? (enforcement brochure)",
   "url": "https://plan.ucr.gov/wp-content/uploads/2025/07/Enforcement-Updated.pdf",
   "publisher": "Unified Carrier Registration Plan",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_far_52_204_7",
   "title": "FAR 52.204-7 System for Award Management (48 CFR 52.204-7, eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-48/section-52.204-7",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_fed_far_52_222_54",
   "title": "FAR 52.222-54 Employment Eligibility Verification (48 CFR 52.222-54, eCFR, current)",
   "url": "https://www.ecfr.gov/current/title-48/section-52.222-54",
   "publisher": "National Archives, Office of the Federal Register (eCFR)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_de_pit",
   "title": "Delaware Individual Income Tax Return, Resident Instructions 2025 (PIT-RES)",
   "url": "https://revenuefiles.delaware.gov/2025/PITForms_Instructions/Instructions/PIT-RES_Instructions_2025-01.pdf",
   "publisher": "Delaware Division of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_de_cit",
   "title": "Corporate Income Tax FAQs",
   "url": "https://revenue.delaware.gov/corporate-income-tax-faqs/",
   "publisher": "Delaware Division of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_de_sct",
   "title": "2025 Delaware S Corporation Reconciliation and Shareholders Information, Form SCT-RTN instructions",
   "url": "https://revenuefiles.delaware.gov/2025/BusinessTaxForms_Instructions/SCT-RTN_2025-01_Instructions.pdf",
   "publisher": "Delaware Division of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_de_grt",
   "title": "Gross Receipts Tax FAQs",
   "url": "https://revenue.delaware.gov/frequently-asked-questions/gross-receipts-tax-faqs/",
   "publisher": "Delaware Division of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_de_wh",
   "title": "Withholding Tax FAQs",
   "url": "https://revenue.delaware.gov/frequently-asked-questions/withholding-tax-faqs/",
   "publisher": "Delaware Division of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ca_ftbpen",
   "title": "Common penalties and fees",
   "url": "https://www.ftb.ca.gov/pay/penalties-and-interest/index.html",
   "publisher": "California Franchise Tax Board",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ca_ftbdue",
   "title": "Due dates: businesses",
   "url": "https://www.ftb.ca.gov/file/when-to-file/due-dates-business.html",
   "publisher": "California Franchise Tax Board",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ca_pub75",
   "title": "Publication 75, Interest, Penalties, and Collection Cost Recovery Fee: when do interest, penalty and collection cost recovery fee charges apply",
   "url": "https://cdtfa.ca.gov/formspubs/pub75/when-do-interest-penalty-collection-cost-recovery-fee-charges-apply.htm",
   "publisher": "California Department of Tax and Fee Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ca_de231ep",
   "title": "Information Sheet: Penalty Reference Chart (DE 231EP, Rev. 3 (1-26))",
   "url": "https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de231ep.pdf",
   "publisher": "California Employment Development Department",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_pitpen",
   "title": "Interest and penalties (personal income tax)",
   "url": "https://www.tax.ny.gov/pit/file/interest_and_penalties.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_ct3i",
   "title": "Instructions for Form CT-3, General Business Corporation Franchise Tax Return",
   "url": "https://www.tax.ny.gov/forms/current-forms/ct/ct3i.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_ct3si",
   "title": "Instructions for Form CT-3-S, New York S Corporation Franchise Tax Return",
   "url": "https://www.tax.ny.gov/forms/current-forms/ct/ct3si.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_it204i",
   "title": "Instructions for Form IT-204, Partnership Return (2025)",
   "url": "https://www.tax.ny.gov/pdf/2025/inc/it204i_2025.pdf",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_it204lli",
   "title": "Instructions for Form IT-204-LL (2025)",
   "url": "https://www.tax.ny.gov/pdf/2025/inc/it204lli_2025.pdf",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_st805",
   "title": "Sales and Use Tax Penalties, Tax Bulletin ST-805",
   "url": "https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/sales_and_use_tax_penalties.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_ny_nys50",
   "title": "Publication NYS-50, Employer's Guide to Unemployment Insurance, Wage Reporting, and Withholding Tax",
   "url": "https://www.tax.ny.gov/forms/publications/wt/nys50.htm",
   "publisher": "New York State Department of Taxation and Finance",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_tx_sales",
   "title": "Sales and Use Tax",
   "url": "https://comptroller.texas.gov/taxes/sales/",
   "publisher": "Texas Comptroller of Public Accounts",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_tx_twcreg",
   "title": "Register a Tax Account",
   "url": "https://www.twc.texas.gov/services/register-tax",
   "publisher": "Texas Workforce Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_tx_tuca213",
   "title": "Texas Unemployment Compensation Act, Labor Code Chapter 213 (Enforcement of Subtitle)",
   "url": "https://www.twc.texas.gov/sites/default/files/ui/docs/tuca-chapter-213-twc.pdf",
   "publisher": "Texas Workforce Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_fl_corp",
   "title": "Florida Corporate Income Tax",
   "url": "https://floridarevenue.com/taxes/taxesfees/Pages/corporate.aspx",
   "publisher": "Florida Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_fl_sales",
   "title": "Florida Sales and Use Tax",
   "url": "https://floridarevenue.com/taxes/taxesfees/Pages/sales_tax.aspx",
   "publisher": "Florida Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_fl_rtpay",
   "title": "Reemployment Tax Report and Payment Information",
   "url": "https://floridarevenue.com/taxes/taxesfees/Pages/rt_return_pay.aspx",
   "publisher": "Florida Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_nv_nac360",
   "title": "NAC Chapter 360, NAC 360.395 Amount of penalty for late payment",
   "url": "https://www.leg.state.nv.us/Division/Legal/LawLibrary/NAC/NAC-360.html",
   "publisher": "Nevada Legislature (Nevada Administrative Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_wa_rcw",
   "title": "RCW 82.32.090 Late payment, disregard of written instructions, evasion, penalties",
   "url": "https://app.leg.wa.gov/RCW/default.aspx?cite=82.32.090",
   "publisher": "Washington State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_wa_hiring",
   "title": "Hiring employees",
   "url": "https://dor.wa.gov/manage-business/grow-business/hiring-employees",
   "publisher": "Washington State Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_wy_t39",
   "title": "Wyoming Statutes Title 39, Taxation and Revenue (W.S. 39-15-108 Enforcement)",
   "url": "https://wyoleg.gov/statutes/compress/title39.pdf",
   "publisher": "Wyoming State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_wy_t27",
   "title": "Wyoming Statutes Title 27, Labor and Employment (W.S. 27-3-503, 27-3-510, 27-14-202, 27-14-203)",
   "url": "https://wyoleg.gov/statutes/compress/title27.pdf",
   "publisher": "Wyoming State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_il_pub103",
   "title": "Publication 103, Penalties and Interest for Illinois Taxes (September 2025)",
   "url": "https://tax.illinois.gov/research/publications/pubs/penalties-and-interest-for-illinois-taxes.html",
   "publisher": "Illinois Department of Revenue",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_nj_1040i",
   "title": "2025 New Jersey Resident Return NJ-1040 instructions",
   "url": "https://www.nj.gov/treasury/taxation/pdf/current/1040i.pdf",
   "publisher": "New Jersey Division of Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_nj_cbt100i",
   "title": "2025 CBT-100 General Instructions for New Jersey Corporation Business Tax Return",
   "url": "https://www.nj.gov/treasury/taxation/pdf/current/cbt/cbt100ins.pdf",
   "publisher": "New Jersey Division of Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_nj_cbt100si",
   "title": "2025 CBT-100S General Instructions for New Jersey S Corporation Business Tax Return",
   "url": "https://www.nj.gov/treasury/taxation/pdf/current/cbt/cbt100sins.pdf",
   "publisher": "New Jersey Division of Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_nj_1065i",
   "title": "2025 NJ-1065 Partnership Return instructions",
   "url": "https://www.nj.gov/treasury/taxation/pdf/current/part/1065i.pdf",
   "publisher": "New Jersey Division of Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s1_usagov",
   "title": "How to pay and get help with state and local taxes",
   "url": "https://www.usa.gov/state-taxes",
   "publisher": "USAGov (U.S. General Services Administration)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nj_anj1",
   "title": "New Jersey Taxpayers' Bill of Rights (Publication ANJ-1)",
   "url": "https://www.nj.gov/treasury/taxation/pdf/pubs/sales/anj1.pdf",
   "publisher": "New Jersey Division of Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nj_reinst",
   "title": "Reinstate a Revoked or Voided Business",
   "url": "https://www.nj.gov/treasury/revenue/reinstate.shtml",
   "publisher": "New Jersey Division of Revenue and Enterprise Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ny_bien",
   "title": "Biennial Statements: Business Corporations and Limited Liability Companies",
   "url": "https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies",
   "publisher": "New York Department of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ar_ft",
   "title": "LLC Franchise Tax Report 2026 (LLC1_FT_2026)",
   "url": "https://www.sos.arkansas.gov/uploads/bcs/LLC1_FT_2026.pdf",
   "publisher": "Arkansas Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_az_faq",
   "title": "Business Services FAQs",
   "url": "https://azcc.gov/faqs/BusinessServicesFAQs",
   "publisher": "Arizona Corporation Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_co_fee",
   "title": "Business Organizations Fee Schedule",
   "url": "https://www.sos.state.co.us/pubs/info_center/fees/business.html",
   "publisher": "Colorado Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_co_status",
   "title": "Business FAQs: Noncompliance",
   "url": "https://www.sos.state.co.us/pubs/business/FAQs/status.html",
   "publisher": "Colorado Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ct_over",
   "title": "Overdue Annual Report",
   "url": "https://business.ct.gov/knowledge-base/articles/annual-report/overdue-annual-report",
   "publisher": "Connecticut Secretary of the State (Business.CT.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_dc_llcfee",
   "title": "Corporations Division Fees - Limited Liability Company",
   "url": "https://dlcp.dc.gov/page/corporations-division-fees-limited-liability-company",
   "publisher": "DC Department of Licensing and Consumer Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_dc_corpfee",
   "title": "Corporations Division Fees - Business Corporation",
   "url": "https://dlcp.dc.gov/page/corporations-division-fees-business-corporation",
   "publisher": "DC Department of Licensing and Consumer Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_dc_llc",
   "title": "Domestic Limited Liability Company",
   "url": "https://dlcp.dc.gov/service/domestic-limited-liability-company",
   "publisher": "DC Department of Licensing and Consumer Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_hi_q3",
   "title": "Third Quarter Hawaii Annual Business Reports Due 2026",
   "url": "https://cca.hawaii.gov/breg/third-quarter-hawaii-annual-business-reports-due-2026/",
   "publisher": "Hawaii Department of Commerce and Consumer Affairs",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_id_601",
   "title": "Idaho Code 30-21-601 (Administrative dissolution: grounds)",
   "url": "https://legislature.idaho.gov/statutesrules/idstat/title30/t30ch21/sect30-21-601/",
   "publisher": "Idaho Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_in_ber",
   "title": "Business Entity Reports",
   "url": "https://www.in.gov/sos/business/business-entity-reports",
   "publisher": "Indiana Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ks_ir",
   "title": "Information Reports",
   "url": "https://sos.ks.gov/businesses/information-reports.html",
   "publisher": "Kansas Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ky_7010",
   "title": "KRS 14A.7-010 Grounds for administrative dissolution",
   "url": "https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=36556",
   "publisher": "Kentucky Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_la_1442",
   "title": "RS 12:1-1442 Administrative termination",
   "url": "https://legis.la.gov/Legis/LawPrint.aspx?d=920452",
   "publisher": "Louisiana State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_la_1308_1",
   "title": "RS 12:1308.1 Annual report (limited liability companies)",
   "url": "https://legis.la.gov/Legis/LawPrint.aspx?d=76256",
   "publisher": "Louisiana State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_la_1308_2",
   "title": "RS 12:1308.2 Failure to file annual report; revocation and reinstatement",
   "url": "https://legis.la.gov/Legis/LawPrint.aspx?d=76257",
   "publisher": "Louisiana State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_me_1622",
   "title": "13-C MRSA 1622 Failure to file annual report; penalties",
   "url": "https://legislature.maine.gov/statutes/13-C/title13-Csec1622.html",
   "publisher": "Maine Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_md_f1",
   "title": "2025 Form 1 Annual Report and Business Personal Property Return",
   "url": "https://dat.maryland.gov/SDAT%20Forms/PPR_Forms/2025_Form1.pdf",
   "publisher": "Maryland State Department of Assessments and Taxation",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mi_4207a",
   "title": "MCL 450.4207a Certificate of good standing (LLC)",
   "url": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-450-4207a",
   "publisher": "Michigan Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mi_1922",
   "title": "MCL 450.1922 Dissolution or revocation for failure to file reports",
   "url": "https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-450-1922",
   "publisher": "Michigan Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mn_ren",
   "title": "Renewing your Business",
   "url": "https://www.sos.mn.gov/business-liens/renewals/",
   "publisher": "Minnesota Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mo_351120",
   "title": "RSMo 351.120 Corporate registration report",
   "url": "https://revisor.mo.gov/main/OneSection.aspx?section=351.120",
   "publisher": "Missouri Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mo_351484",
   "title": "RSMo 351.484 Grounds for administrative dissolution",
   "url": "https://revisor.mo.gov/main/OneSection.aspx?section=351.484",
   "publisher": "Missouri Revisor of Statutes",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_mt_ar",
   "title": "How do I file my annual report?",
   "url": "https://help.sosmt.gov/en-us/article/how-do-i-file-my-annual-report-ywawrv/",
   "publisher": "Montana Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ne_ar",
   "title": "Annual/Biennial Reporting",
   "url": "https://sos.nebraska.gov/business-services/annualbiennial-reporting",
   "publisher": "Nebraska Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nc_57d",
   "title": "G.S. 57D-6-06 Administrative dissolution (LLC)",
   "url": "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_57D/GS_57D-6-06.html",
   "publisher": "North Carolina General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nc_551420",
   "title": "G.S. 55-14-20 Grounds for administrative dissolution",
   "url": "https://www.ncleg.gov/EnactedLegislation/Statutes/PDF/BySection/Chapter_55/GS_55-14-20.pdf",
   "publisher": "North Carolina General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nd_mr",
   "title": "Maintain Registration",
   "url": "https://www.sos.nd.gov/business/business-services/maintain-registration",
   "publisher": "North Dakota Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_or_reinst",
   "title": "Reinstate a Business",
   "url": "https://sos.oregon.gov/business/register/Pages/reinstate-a-business.aspx",
   "publisher": "Oregon Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_pa_ar",
   "title": "Annual Reports",
   "url": "https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports",
   "publisher": "Pennsylvania Department of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ri_ar",
   "title": "File Your Annual Report",
   "url": "https://www.sos.ri.gov/divisions/business-services/ri-business/file-your-annual-report",
   "publisher": "Rhode Island Department of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_vt_1420",
   "title": "11A V.S.A. 14.20 Involuntary termination",
   "url": "https://legislature.vermont.gov/statutes/section/11A/014/00014.20",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_vt_4034",
   "title": "11 V.S.A. 4034 Involuntary termination (LLC)",
   "url": "https://legislature.vermont.gov/statutes/section/11/025/04034",
   "publisher": "Vermont General Assembly",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_va_mb",
   "title": "Maintaining Your Business",
   "url": "https://www.scc.virginia.gov/businesses/maintaining-your-business/",
   "publisher": "Virginia State Corporation Commission",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_wv_code",
   "title": "W. Va. Code 59-1-2a",
   "url": "https://code.wvlegislature.gov/59-1-2A/",
   "publisher": "West Virginia Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_wi_faq",
   "title": "Business Entities FAQ",
   "url": "https://dfi.wi.gov/Pages/BusinessServices/BusinessEntities/FAQ.aspx",
   "publisher": "Wisconsin Department of Financial Institutions",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ak_corp",
   "title": "Alaska Statutes 10.06 (Corporations Code), print view",
   "url": "https://www.akleg.gov/basis/statutes.asp?media=print&secStart=10.06&secEnd=10.07",
   "publisher": "Alaska State Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ga_llc",
   "title": "Renew an LLC",
   "url": "https://georgia.gov/renew-llc",
   "publisher": "State of Georgia (georgia.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ga_corp",
   "title": "Renew a Corporation",
   "url": "https://georgia.gov/renew-corporation",
   "publisher": "State of Georgia (georgia.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ia_490_1420",
   "title": "Iowa Code 490.1420 Grounds for administrative dissolution",
   "url": "https://www.legis.iowa.gov/docs/code/490.1420.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ia_490_1621",
   "title": "Iowa Code 490.1621 Biennial report for secretary of state",
   "url": "https://www.legis.iowa.gov/docs/code/490.1621.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ia_489_708",
   "title": "Iowa Code 489.708 Grounds for administrative dissolution (LLC)",
   "url": "https://www.legis.iowa.gov/docs/code/489.708.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ia_489_212",
   "title": "Iowa Code 489.212 Biennial report (LLC)",
   "url": "https://www.legis.iowa.gov/docs/code/489.212.pdf",
   "publisher": "Iowa Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ma_156c70",
   "title": "M.G.L. c.156C s.70 Administrative dissolution",
   "url": "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter156C/Section70",
   "publisher": "Massachusetts Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ma_156d1420",
   "title": "M.G.L. c.156D s.14.20 Grounds for administrative dissolution",
   "url": "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter156D/Section14.20",
   "publisher": "Massachusetts Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ma_156d1622",
   "title": "M.G.L. c.156D s.16.22 Annual report for secretary of state",
   "url": "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXXII/Chapter156D/Section16.22",
   "publisher": "Massachusetts Legislature",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ma_tip",
   "title": "DCMS Tip Sheet: Reminders Regarding your Annual Report",
   "url": "https://www.mass.gov/info-details/dcms-tip-sheet-volume-5-edition-13-reminders-regarding-your-annual-report",
   "publisher": "Commonwealth of Massachusetts (mass.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nh_136",
   "title": "RSA 293-A:1.36 Penalties Imposed",
   "url": "https://gc.nh.gov/rsa/html/XXVII/293-A/293-A-136.htm",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_nh_122",
   "title": "RSA 293-A:1.22 Filing, Service, and Copying Fees",
   "url": "https://gc.nh.gov/rsa/html/XXVII/293-A/293-A-122.htm",
   "publisher": "New Hampshire General Court",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_sd_ar",
   "title": "Annual Report, Domestic Limited Liability Company (form)",
   "url": "https://sdsos.gov/docs/business/llc-domestic-annualreport.pdf",
   "publisher": "South Dakota Secretary of State",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ut_fees",
   "title": "Fiscal Year 2026 Fee Schedule",
   "url": "https://commerce.utah.gov/wp-content/uploads/2023/04/currentfees.pdf",
   "publisher": "Utah Division of Corporations and Commercial Code",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_ut_renpdf",
   "title": "Renewal form (Division of Corporations)",
   "url": "https://commerce.utah.gov/wp-content/uploads/2021/10/renewal.pdf",
   "publisher": "Utah Division of Corporations and Commercial Code",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_oh_5751_06",
   "title": "Ohio Revised Code 5751.06 Penalty for late filing or delinquent payment",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-5751.06",
   "publisher": "Ohio Legislature (codes.ohio.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_y_s2_oh_5751_051",
   "title": "Ohio Revised Code 5751.051 Tax returns",
   "url": "https://codes.ohio.gov/ohio-revised-code/section-5751.051",
   "publisher": "Ohio Legislature (codes.ohio.gov)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_cfr_passport",
   "title": "22 CFR 51.4 Validity of passports (Code of Federal Regulations, 2024 edition)",
   "url": "https://www.govinfo.gov/content/pkg/CFR-2024-title22-vol1/xml/CFR-2024-title22-vol1-sec51-4.xml",
   "publisher": "US Government Publishing Office (govinfo)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_usa_child",
   "title": "Get a passport for a minor under 18",
   "url": "https://www.usa.gov/child-passport",
   "publisher": "USAGov (General Services Administration)",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_sss_26",
   "title": "Men 26 and Older",
   "url": "https://www.sss.gov/register/men-26-and-older/",
   "publisher": "Selective Service System",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_i90",
   "title": "Replace Your Green Card",
   "url": "https://www.uscis.gov/green-card/after-we-grant-your-green-card/replace-your-green-card",
   "publisher": "US Citizenship and Immigration Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_i751",
   "title": "When to File Your Petition to Remove Conditions",
   "url": "https://www.uscis.gov/forms/when-to-file-your-petition-to-remove-conditions",
   "publisher": "US Citizenship and Immigration Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ar11",
   "title": "How to Change Your Address",
   "url": "https://www.uscis.gov/addresschange",
   "publisher": "US Citizenship and Immigration Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ca_dl",
   "title": "Renew Your Driver's License",
   "url": "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/renew-your-driver-license/",
   "publisher": "California Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ca_regpen",
   "title": "Penalties (vehicle registration fees)",
   "url": "https://www.dmv.ca.gov/portal/vehicle-registration/registration-fees/penalties/",
   "publisher": "California Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ca_coa",
   "title": "Update Information on Your Driver's License or ID Card",
   "url": "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/updating-information-on-your-driver-license-or-identification-dl-id-card/",
   "publisher": "California Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_tx_dlfees",
   "title": "Driver License Fees",
   "url": "https://www.dps.texas.gov/section/driver-license/driver-license-fees",
   "publisher": "Texas Department of Public Safety",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_tx_coa",
   "title": "How to Change Information on Your Driver License or ID Card",
   "url": "https://www.dps.texas.gov/section/driver-license/how-change-information-your-driver-license-or-id-card",
   "publisher": "Texas Department of Public Safety",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_tx_reg",
   "title": "Register Your Vehicle",
   "url": "https://www.txdmv.gov/motorists/register-your-vehicle",
   "publisher": "Texas Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ny_dl",
   "title": "Renew a Driver License",
   "url": "https://dmv.ny.gov/driver-license/renew-a-driver-license",
   "publisher": "New York State Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ny_reg",
   "title": "Renew a Registration",
   "url": "https://dmv.ny.gov/registration/renew-a-registration",
   "publisher": "New York State Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ny_coa",
   "title": "Change Your Address",
   "url": "https://dmv.ny.gov/records/change-your-address",
   "publisher": "New York State Department of Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_fl_dl",
   "title": "Renew or Replace Your Florida Driver License or ID Card",
   "url": "https://www.flhsmv.gov/driver-licenses-id-cards/renew-or-replace-your-florida-driver-license-or-id-card/",
   "publisher": "Florida Department of Highway Safety and Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_fl_reg",
   "title": "Motor Vehicle Registrations",
   "url": "https://www.flhsmv.gov/motor-vehicles-tags-titles/license-plates-registration/motor-vehicle-registrations/",
   "publisher": "Florida Department of Highway Safety and Motor Vehicles",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_mc_iep",
   "title": "When does Medicare coverage start?",
   "url": "https://www.medicare.gov/basics/get-started-with-medicare/sign-up/when-does-medicare-coverage-start",
   "publisher": "Centers for Medicare & Medicaid Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_cbp_entry",
   "title": "Entry Summary",
   "url": "https://www.cbp.gov/trade/programs-administration/entry-summary",
   "publisher": "US Customs and Border Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_cbp_isf",
   "title": "Frequently Asked Questions: Importer Security Filing (ISF) and Additional Carrier Requirements (May 2023)",
   "url": "https://cbp.gov/sites/default/files/assets/documents/2023-May/ISF%20FAQ%202.0%20(508).pdf",
   "publisher": "US Customs and Border Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_cbp_rk",
   "title": "What Every Member of the Trade Community Should Know About: Recordkeeping (revised January 2005)",
   "url": "https://www.cbp.gov/sites/default/files/assets/documents/2016-Apr/icp027_3.pdf",
   "publisher": "US Customs and Border Protection",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_census_qg",
   "title": "Quick Guide to Title 15, Part 30, Foreign Trade Regulations",
   "url": "https://www.census.gov/foreign-trade/regulations/quickguide.pdf",
   "publisher": "US Census Bureau",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_fda_pn",
   "title": "Guidance for Industry: What You Need to Know About Prior Notice of Imported Food Shipments",
   "url": "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-what-you-need-know-about-prior-notice-imported-food-shipments",
   "publisher": "US Food and Drug Administration",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_i765",
   "title": "I-765, Application for Employment Authorization",
   "url": "https://www.uscis.gov/i-765",
   "publisher": "US Citizenship and Immigration Services",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_sar_instr",
   "title": "FinCEN Suspicious Activity Report (FinCEN SAR) Electronic Filing Instructions (Release April 2026, version 1.0)",
   "url": "https://bsaefiling.fincen.gov/resources/FinCENSARFilingInstructions.pdf",
   "publisher": "Financial Crimes Enforcement Network",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_ctr_faq",
   "title": "Frequently Asked Questions Regarding the FinCEN Currency Transaction Report (CTR)",
   "url": "https://www.fincen.gov/resources/frequently-asked-questions-regarding-fincen-currency-transaction-report-ctr",
   "publisher": "Financial Crimes Enforcement Network",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_casino_faq",
   "title": "Frequently Asked Questions: Casino Recordkeeping, Reporting, and Compliance Program Requirements (FIN-2012-G004)",
   "url": "https://www.fincen.gov/resources/statutes-regulations/guidance/frequently-asked-questions-casino-recordkeeping-reporting",
   "publisher": "Financial Crimes Enforcement Network",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_madrid",
   "title": "Inbound Madrid Protocol post registration",
   "url": "https://www.uspto.gov/ip-policy/international-protection/madrid-protocol/inbound-post-registration",
   "publisher": "United States Patent and Trademark Office",
   "checked": "2026-11-11"
  },
  {
   "id": "us_x_g_src_sss_verify",
   "title": "Learn About Verification",
   "url": "https://www.sss.gov/verify/about/",
   "publisher": "Selective Service System",
   "checked": "2026-11-11"
  }
 ],
 "patches": {
  "us_8889": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause. Separately, HSA distributions not used for qualified medical expenses are taxed with an additional 20% tax unless an exception applies.",
   "penaltySource": "us_y_fed_i1040gi",
   "note": "Form 8889 has no penalty of its own for late filing; it is part of the Form 1040 return, so the Form 1040 late-filing and late-payment penalties apply. The 20% figure is from the Instructions for Form 8889 (https://www.irs.gov/instructions/i8889)."
  },
  "us_1040nr_wages": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns; the Form 1040-NR instructions refer to the Form 1040 instructions for interest and penalties). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040nr"
  },
  "us_1040nr": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns; the Form 1040-NR instructions refer to the Form 1040 instructions for interest and penalties). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040nr"
  },
  "us_se": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040gi",
   "note": "No separate late penalty for Schedule SE; it is part of Form 1040, so the Form 1040 late-filing and late-payment penalties apply."
  },
  "us_sched_d": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040gi",
   "verified": true,
   "source": "us_y_fed_f1040sd",
   "note": "Penalty is the Form 1040 penalty; Schedule D is part of the return. Due date of Form 1040 read in Pub. 509 (https://www.irs.gov/publications/p509)."
  },
  "us_sched_e": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040gi",
   "verified": true,
   "source": "us_y_fed_f1040se",
   "note": "Penalty is the Form 1040 penalty; Schedule E is part of the return. Schedule E can also be attached to Form 1040-NR or Form 1041."
  },
  "us_sched_h": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause. An estimated tax penalty may also apply if household employment taxes are not covered by withholding or estimated payments. Separate penalties apply for not giving Forms W-2 to employees or not filing them with SSA on time.",
   "penaltySource": "us_y_fed_i1040sh",
   "note": "Late-filing and late-payment figures are from the Form 1040 instructions (https://www.irs.gov/instructions/i1040gi), since Schedule H is filed with Form 1040."
  },
  "us_709": {
   "penalty": "Section 6651 penalties for late filing and late payment unless there is reasonable cause: 5% of the tax for each month or part of a month the return is late, up to 25% (15% a month up to 75% if fraudulent); 0.5% a month of unpaid tax, up to 25% (1% a month after a levy notice). Also penalties for willful failure to file, and for valuation understatements (reported value 65% or less of actual is substantial; 40% or less is gross).",
   "penaltySource": "us_y_fed_i709",
   "note": "Percentages read in 26 U.S.C. 6651 (govinfo, 2024 edition), which the Form 709 instructions name as the penalty section."
  },
  "us_boi": {
   "penalty": "Willful failure to report complete or updated beneficial ownership information, or willfully giving false information: civil penalty of up to $500 for each day the violation continues (adjusted for inflation; FinCEN's FAQ gives $591 at the time it was published), and criminal fine of up to $10,000, up to 2 years in prison, or both. Safe harbor in the statute for a person who corrects an inaccurate report voluntarily and promptly, no later than 90 days after submitting it.",
   "penaltySource": "us_y_fed_usc31_5336",
   "note": "FinCEN FAQ K.2 (https://www.fincen.gov/boi-faqs): 'this civil penalty amount is adjusted annually for inflation. As of the time of publication of this FAQ, this amount is $591.' Since the final rule (effective August 14, 2026), only companies formed under foreign law and registered to do business in a US State or Tribal jurisdiction must report."
  },
  "us_fdre_1040nr": {
   "penalty": "Late filing (return not filed by the due date, including extensions): usually 5% of the amount due for each month or part of a month the return is late, up to 25%; 15% a month up to 75% if the failure is fraudulent. If the return is more than 60 days late, the minimum penalty is $525 or the tax owed, whichever is smaller (2025 returns; the Form 1040-NR instructions refer to the Form 1040 instructions for interest and penalties). Late payment: usually 1/2 of 1% of the unpaid tax for each month or part of a month, up to 25%, plus interest. If both apply in a month, the late-filing penalty is reduced by the late-payment penalty. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1040nr"
  },
  "us_fdre_1120f": {
   "penalty": "Late filing: 5% of the unpaid tax for each month or part of a month the return is late, up to 25%; for a return required to be filed in 2026 that is more than 60 days late, the minimum is the smaller of the tax due or $525. Late payment: 1/2 of 1% of the unpaid tax per month or part of a month, up to 25%. Interest also runs. In addition, a foreign corporation gets deductions and credits against effectively connected income only if Form 1120-F is filed on time (generally no later than 18 months after the due date).",
   "penaltySource": "us_y_fed_i1120f"
  },
  "us_fdre_w8": {
   "penalty": "No IRS penalty for the foreign person. If the form is not given to the payer, the withholding agent may have to withhold at the 30% rate (chapters 3 and 4), the backup withholding rate, or the rate under section 1446.",
   "penaltySource": "us_y_fed_iw8ben",
   "note": "The W-8BEN-E instructions (https://www.irs.gov/instructions/iw8bene) state the same consequence for entities."
  },
  "us_1041": {
   "penalty": "Late filing: 5% of the tax due for each month or part of a month the return isn't filed, up to 25% (15% a month up to 75% if fraudulent); if more than 60 days late, the minimum is the smaller of $525 or the tax due. Late payment: 1/2 of 1% of the unpaid amount for each month or part of a month, up to 25%, plus interest. Not imposed if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1041"
  },
  "us_1041k1": {
   "penalty": "For each failure to give a beneficiary Schedule K-1 when due, or to include all required or correct information: $340 per Schedule K-1, up to $4,098,500 for all failures in a calendar year. If intentionally disregarded: $680 or, if greater, 10% of the items required to be reported, with no maximum. Not imposed for reasonable cause.",
   "penaltySource": "us_y_fed_i1041",
   "note": "Figures are those in the 2025 Instructions for Form 1041 (statements due in 2026). The IRS information return penalties page shows $340 / $4,191,500 for statements due in 2027."
  },
  "us_1041d": {
   "penalty": "Late filing: 5% of the tax due for each month or part of a month the return isn't filed, up to 25% (15% a month up to 75% if fraudulent); if more than 60 days late, the minimum is the smaller of $525 or the tax due. Late payment: 1/2 of 1% of the unpaid amount for each month or part of a month, up to 25%, plus interest. Not imposed if there is reasonable cause.",
   "penaltySource": "us_y_fed_i1041",
   "note": "Schedule D (Form 1041) is part of Form 1041; the Form 1041 late-filing and late-payment penalties apply."
  },
  "us_1041es": {
   "penalty": "Underpayment of estimated tax penalty (figured on Form 2210) if the estate or trust didn't pay enough estimated tax or paid late. It is figured on each underpayment for the number of days it remains unpaid, using the published quarterly interest rates for underpayments, and may apply even if the return shows an overpayment. Generally not waived for reasonable cause, but may be waived for a casualty, disaster or other unusual circumstance.",
   "penaltySource": "us_y_fed_irs_estind",
   "note": "Form 1041-ES (https://www.irs.gov/pub/irs-pdf/f1041es.pdf) also says: 'The penalty is imposed on each underpayment for the number of days it remains unpaid.' No percentage is printed; the rate is the IRS quarterly underpayment interest rate."
  },
  "us_706": {
   "penalty": "Section 6651 penalties for late filing and late payment unless there is reasonable cause: 5% of the tax per month or part of a month the return is late, up to 25% (15%/75% if fraudulent); 0.5% a month of unpaid tax, up to 25%. Also a 20% penalty on underpayments due to negligence or a substantial valuation understatement (reported value 65% or less of actual), rising to 40% for a gross valuation understatement (40% or less); no valuation penalty if the underpayment from it is $5,000 or less.",
   "penaltySource": "us_y_fed_i706",
   "note": "Monthly percentages read in 26 U.S.C. 6651 (govinfo, 2024 edition), which the Form 706 instructions name."
  },
  "us_990t": {
   "penalty": "Late filing: 5% of the unpaid tax for each month or part of a month the return is late, up to 25%; if more than 60 days late, the minimum is the smaller of the tax due or $525. Late payment: usually 1/2 of 1% of the unpaid tax per month or part of a month, up to 25%. Interest at the section 6621 underpayment rate. An estimated tax penalty may also apply (section 6655) if tax for the year is $500 or more.",
   "penaltySource": "us_y_fed_i990t"
  },
  "us_1042": {
   "penalty": "Late filing of Form 1042: 5% of the unpaid tax for each month or part of a month the return is late, up to 25% (including extensions). Late payment: usually 1/2 of 1% of the unpaid tax per month or part of a month, up to 25%. Interest is charged; penalties may also apply for negligence, substantial understatement and fraud. Form 1042-S failures are information-return penalties: for statements due in 2026, $60 per return if up to 30 days late, $130 if 31 days late through August 1, $340 after August 1 or not filed, $680 for intentional disregard, with annual caps.",
   "penaltySource": "us_y_fed_i1042",
   "note": "Form 1042-S figures are from the IRS information return penalties page (https://www.irs.gov/payments/information-return-penalties), which lists penalties per information return and payee statement; it does not name Form 1042-S specifically. Treat the 1042-S figures as indicative."
  },
  "us_720": {
   "penalty": "Penalties for late filing and late payment under section 6651: 5% of the tax for each month or part of a month the return is late, up to 25%; 0.5% a month of unpaid tax, up to 25% (1% a month after a levy notice). Paying tax with Form 720 instead of depositing it may draw a penalty. If collected communications, air transportation or indoor tanning taxes are not paid over, the trust fund recovery penalty equals the full unpaid tax.",
   "penaltySource": "us_y_fed_usc26_6651",
   "note": "The Form 720 instructions (https://www.irs.gov/instructions/i720) do not print the late-filing percentages; they come from the statute. The trust fund recovery penalty and deposit warning are from the Form 720 instructions."
  },
  "us_2290": {
   "penalty": "Penalties for late filing and late payment under section 6651: 5% of the tax for each month or part of a month the return is late, up to 25%; 0.5% a month of unpaid tax, up to 25%; plus interest. Not charged if there is reasonable cause.",
   "penaltySource": "us_y_fed_usc26_6651",
   "note": "The Form 2290 instructions (https://www.irs.gov/instructions/i2290) mention late filing and late payment penalties but print no figures; figures are from 26 U.S.C. 6651."
  },
  "us_941": {
   "penalty": "Late filing: 5% of the unpaid tax due with the return for each whole or part month, up to 25%. Late payment: 0.5% a month, up to 25%. If both apply in a month, the filing penalty is reduced by the payment penalty. Late deposits: 2% if 1-5 days late, 5% if 6-15 days late, 10% if 16 or more days late (or paid directly to the IRS or with the return instead of deposited), 15% if still unpaid more than 10 days after the first IRS notice. Withheld income, social security and Medicare taxes not paid over: trust fund recovery penalty of 100% of the unpaid trust fund tax on responsible persons. Not charged for reasonable cause.",
   "penaltySource": "us_y_fed_p15",
   "note": "The Form 941 instructions say: 'Penalties and interest are charged on taxes paid late and returns filed late at a rate set by law. See sections 11 and 12 of Pub. 15 for details.' Pub. 15 section 12 covers Forms 941, 943, 944 and 945."
  },
  "us_944": {
   "penalty": "Late filing: 5% of the unpaid tax due with the return for each whole or part month, up to 25%. Late payment: 0.5% a month, up to 25%. If both apply in a month, the filing penalty is reduced by the payment penalty. Late deposits: 2% if 1-5 days late, 5% if 6-15 days late, 10% if 16 or more days late (or paid directly to the IRS or with the return instead of deposited), 15% if still unpaid more than 10 days after the first IRS notice. Withheld income, social security and Medicare taxes not paid over: trust fund recovery penalty of 100% of the unpaid trust fund tax on responsible persons. Not charged for reasonable cause.",
   "penaltySource": "us_y_fed_p15",
   "note": "The Form 944 instructions refer to sections 11 and 12 of Pub. 15 for penalties."
  },
  "us_940": {
   "penalty": "Late filing: 5% of the unpaid tax due with the return for each whole or part month, up to 25%. Late payment: 0.5% a month, up to 25%. If both apply in a month, the filing penalty is reduced by the payment penalty. Late deposits: 2% if 1-5 days late, 5% if 6-15 days late, 10% if 16 or more days late (or paid directly to the IRS or with the return instead of deposited), 15% if still unpaid more than 10 days after the first IRS notice. Not charged for reasonable cause.",
   "penaltySource": "us_y_fed_p15"
  },
  "us_1095c": {
   "penalty": "Information reporting penalties: $340 for each Form 1094-C/1095-C return not filed correctly, up to $4,098,500 a calendar year, and $340 for each correct Form 1095-C not furnished to an employee, up to $4,098,500; higher amounts for intentional disregard. $340 per return for not filing electronically when required without a waiver. May be waived for reasonable cause.",
   "penaltySource": "us_y_fed_i109495c",
   "verified": true,
   "source": "us_y_fed_i109495c",
   "note": "For 2025 the employee copy deadline was automatically extended from January 31 to March 2, 2026, and February 28 fell on a weekend so paper filing moved to March 2, 2026. Figures are for returns due in 2026 (2025 instructions); the IRS information return page lists the general figures for 2027."
  },
  "us_x_osha_log": {
   "penalty": "OSHA can cite the employer. Maximum civil penalties for penalties proposed after January 15, 2025: other-than-serious violation up to $16,550; serious violation up to $16,550; failure to correct up to $16,550 per day; willful violation $11,823 to $165,514; repeated violation up to $165,514. Knowingly making a false statement in a record or report required under the Act: criminal fine up to $10,000, up to 6 months in prison, or both.",
   "penaltySource": "us_y_fed_ecfr_29cfr1903_15"
  },
  "us_x_osha_300a": {
   "penalty": "OSHA can cite the employer. A posting requirement violation (OSH Act section 17(i)) is up to $16,550. Maximum civil penalties for penalties proposed after January 15, 2025: other-than-serious violation up to $16,550; serious violation up to $16,550; failure to correct up to $16,550 per day; willful violation $11,823 to $165,514; repeated violation up to $165,514. Knowingly making a false statement in a record or report required under the Act: criminal fine up to $10,000, up to 6 months in prison, or both.",
   "penaltySource": "us_y_fed_ecfr_29cfr1903_15",
   "note": "osha.gov refused automated access (403). Amounts are from 29 CFR 1903.15(d) on eCFR (no 2026 amendment in eCFR's history; DOL's 2026 adjustment rule, per the WHD penalties page, left 2025 amounts unchanged). Part 1904 lists 29 U.S.C. 666 among its authorities; the false-records penalty is 29 U.S.C. 666(g). The amount in a given case depends on OSHA's classification of the violation. Which section OSHA would cite a missing Form 300A posting under was not read on an official page; the posting (17(i)) and other-than-serious (17(c)) maximums are both $16,550."
  },
  "us_x_osha_ita": {
   "penalty": "OSHA can cite the employer. Maximum civil penalties for penalties proposed after January 15, 2025: other-than-serious violation up to $16,550; serious violation up to $16,550; failure to correct up to $16,550 per day; willful violation $11,823 to $165,514; repeated violation up to $165,514. Knowingly making a false statement in a record or report required under the Act: criminal fine up to $10,000, up to 6 months in prison, or both.",
   "penaltySource": "us_y_fed_ecfr_29cfr1903_15"
  },
  "us_x_osha_severe": {
   "penalty": "OSHA can cite the employer. Maximum civil penalties for penalties proposed after January 15, 2025: other-than-serious violation up to $16,550; serious violation up to $16,550; failure to correct up to $16,550 per day; willful violation $11,823 to $165,514; repeated violation up to $165,514.",
   "penaltySource": "us_y_fed_ecfr_29cfr1903_15",
   "note": "osha.gov refused automated access (403). Amounts are from 29 CFR 1903.15(d) on eCFR (no 2026 amendment in eCFR's history; DOL's 2026 adjustment rule, per the WHD penalties page, left 2025 amounts unchanged). Part 1904 lists 29 U.S.C. 666 among its authorities; the false-records penalty is 29 U.S.C. 666(g). The amount in a given case depends on OSHA's classification of the violation."
  },
  "us_x_newhire": {
   "penalty": "Set by each state. Federal law lets a state impose a civil money penalty of not more than $25 for each new hire not reported, or not more than $500 if the failure results from a conspiracy between employer and employee not to report or to report falsely.",
   "penaltySource": "us_y_fed_usc42_653a",
   "note": "acf.gov returned an empty 202 response twice; the federal statute was used instead. The actual penalty is whatever the employer's state has chosen, up to these caps."
  },
  "us_x_flsa_records": {
   "penalty": "Violating the FLSA recordkeeping requirements (section 11(c)) is a prohibited act. A willful violation can bring, on conviction, a fine of up to $10,000, up to six months in prison (only after a prior conviction), or both. No general civil money penalty for recordkeeping is listed on the Wage and Hour penalties page (it lists one only for homeworker recordkeeping violations: up to $1,313).",
   "penaltySource": "us_y_fed_usc29_216"
  },
  "us_x_eeoc_records": {
   "penalty": "No fine is stated. If an employer fails or refuses to make, keep or preserve the records required by the EEOC, the federal district court can, on application of the EEOC, order it to comply.",
   "penaltySource": "us_y_fed_usc42_2000e_8"
  },
  "us_x_fmla_notice": {
   "penalty": "Failing to give the required FMLA notices may count as interference with, restraint or denial of the employee's FMLA rights. The employer may be liable for compensation and benefits lost because of it, other actual monetary losses, and equitable relief such as employment, reinstatement or promotion. (Separately, a willful violation of the FMLA general posting requirement carries a civil money penalty of up to $216, 2026.)",
   "penaltySource": "us_y_fed_ecfr_29cfr825_300",
   "note": "The $216 posting penalty is from the WHD civil money penalty page (https://www.dol.gov/agencies/whd/resources/penalties): 2026 amounts unchanged from 2025."
  },
  "us_x_warn": {
   "penalty": "An employer that orders a plant closing or mass layoff without the required notice is liable to each affected employee for back pay and benefits for each day of violation, up to 60 days (and no more than half the days the employee was employed), reduced by wages and certain payments made. Failing to notify the unit of local government: civil penalty of up to $500 a day, unless the employer pays each employee what it owes within 3 weeks of the shutdown or layoff.",
   "penaltySource": "us_y_fed_usc29_2104",
   "note": null
  },
  "us_x_sar": {
   "penalty": "No penalty specific to the SAR was found. If a participant or beneficiary asks for information the administrator must furnish and it is not mailed within 30 days, a court may hold the administrator personally liable for up to $110 a day (statutory $100, adjusted by regulation), plus other relief.",
   "penaltySource": "us_y_fed_usc29_1132"
  },
  "us_x_401k_deposit": {
   "penalty": "Late deposit of employees' deferrals can be a prohibited transaction and an operational mistake that can disqualify the plan. The employer must deposit the missed deferrals with lost earnings. The disqualified person pays an excise tax of 15% of the amount involved for each year; if not corrected, an additional tax of 100% of the amount involved may be due.",
   "penaltySource": "us_y_fed_irs_fixit_deferrals",
   "note": "Read on irs.gov (the IRS administers the excise tax). The EBSA FAQ page used for the deadline states no penalty."
  },
  "us_x_cobra": {
   "penalty": "A plan administrator who fails to give the COBRA general notice (at the start of coverage) or the election notice to qualified beneficiaries may, at the court's discretion, be personally liable to each participant or beneficiary for up to $110 a day from the date of the failure (statutory $100, raised to $110 by regulation), plus other relief the court orders. Each affected participant is a separate violation.",
   "penaltySource": "us_y_fed_usc29_1132"
  },
  "us_x_gag_clause": {
   "penalty": "Excise tax on a group health plan that fails to meet the chapter 100 requirements (which include the annual gag clause attestation): $100 for each day of noncompliance for each individual the failure relates to.",
   "penaltySource": "us_y_fed_usc26_4980D"
  },
  "us_x_partd_notice": {
   "penalty": "No penalty on the employer is stated. The consequence falls on individuals: Medicare imposes a late enrollment penalty on people who go 63 days or longer without creditable coverage after their initial enrollment period, which is why the notice matters to them.",
   "penaltySource": "us_y_fed_cms_creditable"
  },
  "us_x_hipaa_breach": {
   "penalty": "Civil money penalties per violation of a HIPAA administrative simplification provision (2025 inflation-adjusted amounts): did not know and could not reasonably have known, $145 to $73,011; reasonable cause and not willful neglect, $1,461 to $73,011; willful neglect corrected within 30 days, $14,602 to $73,011; willful neglect not corrected, $73,011 to $2,190,294. Calendar-year cap for identical violations: $2,190,294.",
   "penaltySource": "us_y_fed_ecfr_45cfr102_3",
   "note": "hhs.gov refused automated access (403). The breach notification rules are in 45 CFR part 164, subchapter C, and 45 CFR 160.103 defines 'administrative simplification provision' to include any requirement of 'this subchapter', so these penalties apply. Base amounts in 160.404; adjusted amounts in 45 CFR 102.3 (eCFR, last amended January 28, 2026)."
  },
  "us_x_hipaa_annual": {
   "penalty": "Civil money penalties per violation of a HIPAA administrative simplification provision (2025 inflation-adjusted amounts): did not know and could not reasonably have known, $145 to $73,011; reasonable cause and not willful neglect, $1,461 to $73,011; willful neglect corrected within 30 days, $14,602 to $73,011; willful neglect not corrected, $73,011 to $2,190,294. Calendar-year cap for identical violations: $2,190,294.",
   "penaltySource": "us_y_fed_ecfr_45cfr102_3"
  },
  "us_x_boi_update": {
   "penalty": "Willful failure to report complete or updated beneficial ownership information, or willfully giving false information: civil penalty of up to $500 for each day the violation continues (adjusted for inflation; FinCEN's FAQ gives $591 at the time it was published), and criminal fine of up to $10,000, up to 2 years in prison, or both. Safe harbor in the statute for a person who corrects an inaccurate report voluntarily and promptly, no later than 90 days after submitting it.",
   "penaltySource": "us_y_fed_usc31_5336",
   "dueText": "A reporting company must file an updated report within 30 calendar days after any change to required information previously submitted about the company or its beneficial owners, and a corrected report within 30 calendar days after it becomes aware or has reason to know that a report was inaccurate.",
   "due": {
    "t": "event",
    "text": "Within 30 calendar days after a change in the reported information, or after learning that a report was inaccurate"
   },
   "source": "us_y_fed_ecfr_31cfr1010_380",
   "note": "Our dueText and due rule were incomplete, not wrong in substance: the 30-day period applies to reporting companies too. Read in the current eCFR text of 31 CFR 1010.380, which includes the August 14, 2026 amendment (eCFR version history). FinCEN's BOI FAQ H.1 also says 'no later than 30 days after the date of the change'. Updates about company applicants are not required. US persons' information is not reported."
  },
  "us_x_formd": {
   "penalty": "No fine is set by the rule. If a court has enjoined the issuer (or a predecessor or affiliate) for failing to file Form D as Rule 503 requires, the Rule 504 and Rule 506 exemptions are no longer available to it, unless the SEC decides on good cause that they need not be denied.",
   "penaltySource": "us_y_fed_ecfr_17cfr230_507",
   "note": "sec.gov refused automated access (403) twice; the rule text on eCFR was used."
  },
  "us_x_formd_annual": {
   "penalty": "No fine is set by the rule. If a court has enjoined the issuer (or a predecessor or affiliate) for failing to file Form D as Rule 503 requires, the Rule 504 and Rule 506 exemptions are no longer available to it, unless the SEC decides on good cause that they need not be denied.",
   "penaltySource": "us_y_fed_ecfr_17cfr230_507"
  },
  "us_x_franchise": {
   "penalty": "Failing to follow the Franchise Rule's updating requirements is an unfair or deceptive act or practice in violation of Section 5 of the FTC Act, enforced under Sections 5, 13(b) and 19 of the FTC Act. For a knowing violation of an FTC trade regulation rule, the FTC can seek a civil penalty of up to $53,088 per violation (penalties assessed after January 17, 2025).",
   "penaltySource": "us_y_fed_ecfr_16cfr436"
  },
  "us_x_be15": {
   "penalty": "Whoever fails to report is subject to a civil penalty and to injunctive relief ordering compliance, or both; the civil penalty for failure to furnish information is at least $5,911 and at most $59,114 (current inflation-adjusted amounts in 15 CFR 6.3). Willful failure to report: a fine and, for an individual, up to one year in prison, or both; officers, directors, employees or agents who knowingly participate face the same (22 U.S.C. 3105).",
   "penaltySource": "us_y_fed_bea_be15_instr",
   "verified": true,
   "source": "us_y_fed_bea_fdius",
   "note": "Amounts from 15 CFR 6.3(b) on eCFR ('minimum from $5,761 to $5,911; maximum from $57,617 to $59,114'; last amended January 15, 2025). The 2025 booklet says a BE-15 report is required for each US business enterprise in which foreign persons owned or controlled 50 percent or more of the voting securities at the end of the fiscal year ending in 2025, and persons contacted by BEA must respond (report or Claim for Exemption). The page states 2025 BE-15 is electronic-only. Next year's (2026) date is not yet published."
  },
  "us_x_be11": {
   "penalty": "Whoever fails to report is subject to a civil penalty and to injunctive relief ordering compliance, or both; the civil penalty for failure to furnish information is at least $5,911 and at most $59,114 (current inflation-adjusted amounts in 15 CFR 6.3). Willful failure to report: a fine and, for an individual, up to one year in prison, or both; officers, directors, employees or agents who knowingly participate face the same (22 U.S.C. 3105).",
   "penaltySource": "us_y_fed_bea_be11_instr",
   "verified": true,
   "source": "us_y_fed_bea_dia",
   "note": "Amounts from 15 CFR 6.3(b) on eCFR. The 2025 instructions also say persons contacted by BEA about being subject to reporting must respond. BEA dropped the annual BE-11C requirement for minority-owned affiliates for 2025. Next year's date not yet published."
  },
  "us_x_tier2": {
   "penalty": "Civil penalty for violating the EPCRA section 312 inventory reporting requirement (42 U.S.C. 11022): up to $71,545 per violation for penalties assessed on or after January 8, 2025 (statutory $25,000); each day a violation continues is a separate violation.",
   "penaltySource": "us_y_fed_ecfr_40cfr19_4"
  },
  "us_x_biennial_hw": {
   "penalty": "RCRA civil penalty for violating any hazardous waste requirement of subchapter III (which includes the generator biennial report under 42 U.S.C. 6922(a)(6)): up to $93,058 per violation for penalties assessed on or after January 8, 2025 (statutory $25,000), each day a separate violation.",
   "penaltySource": "us_y_fed_ecfr_40cfr19_4"
  },
  "us_x_clearinghouse": {
   "penalty": "Civil penalty of up to $7,155 for an employer who violates any provision of 49 CFR part 382, subpart G (the Clearinghouse rules, including the pre-employment and annual queries in 382.701).",
   "penaltySource": "us_y_fed_ecfr_49cfr386_appB",
   "note": "fmcsa.dot.gov refused automated access (403); eCFR was used. Section 382.701 is in subpart G of part 382 (eCFR structure). The Clearinghouse FAQ page (clearinghouse.fmcsa.dot.gov) mentions penalties only for knowingly false information."
  },
  "us_x_ucr": {
   "penalty": "Set by each state. Roadside officers document the violation and issue a citation; participating states may impose reasonable fines and penalties under their own laws for failing to submit the UCR information or pay the fee.",
   "penaltySource": "us_y_fed_ucr_enforcement",
   "note": "The brochure says 'UCR requires interstate carriers to register annually and pay a fee.' No official page read states the last day to register for a registration year; fmcsa.dot.gov refused automated access (403), and www.ucr.gov returned only an app shell with no text."
  },
  "us_x_sam": {
   "penalty": "No fine. If not renewed every 365 days the registration does not stay active. An offeror must be registered in SAM when it submits an offer or quotation and at the time of award, and must keep the registration through performance and final payment (FAR 52.204-13).",
   "penaltySource": "us_y_fed_far_52_204_7",
   "note": "SAM.gov: 'You must renew your registration every 365 days to keep it active.' FAR 4.1103 requires contracting officers to verify registration. The text of 52.204-13 itself was not read."
  },
  "us_x_everify": {
   "penalty": "No fine set by the clause. DHS or SSA may terminate the contractor's E-Verify MOU and deny access to E-Verify, and the contractor is then referred to a suspending and debarring official for possible suspension or debarment from federal contracting.",
   "penaltySource": "us_y_fed_far_52_222_54"
  },
  "us_de_pit": {
   "penalty": "Late-filed returns with a balance due: a penalty of 5% per month of the balance due. Failure to pay: 1% per month, up to 25%, of the tax due, in addition to interest. Interest on late or underpaid tax: 1/2% per month from the payment due date. Separate penalties apply for negligence, fraud and substantial understatement.",
   "penaltySource": "us_y_s1_de_pit",
   "note": "Figures are from the 2025 resident instructions (revised 03/26/26)."
  },
  "us_ca_pit": {
   "penalty": "Delinquent filing penalty (not paid by the due date and not filed by the extended due date): 5% of the amount due for each month or part of a month unpaid, from the original due date, up to 25%. If the balance due is $540 or less, the penalty is $135 or 100% of the amount due, whichever is less. Late payment: 5% of the unpaid tax plus 0.5% for each month or part of a month unpaid, up to 40 months. Interest also applies.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ny_pit": {
   "penalty": "Late filing (without a valid extension): 5% of the tax due for each month or part of a month the return is late, up to 25%; if more than 60 days late, the minimum penalty is the lesser of $100 or the total amount due. Late payment: 0.5% of the unpaid amount per month or part of a month, up to 25%, plus interest compounded daily.",
   "penaltySource": "us_y_s1_ny_pitpen"
  },
  "us_il_pit": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for taxes the Department administers; income tax due must be paid by the original due date even when the filing date is extended."
  },
  "us_nj_pit": {
   "penalty": "Late filing (after the original or extended due date): 5% per month or part of a month, up to 25%, of the outstanding tax; a $100 penalty for each month the return is late may also be charged. Late payment: 5% of the outstanding balance. Interest: 3% above the prime rate for each month or part of a month unpaid.",
   "penaltySource": "us_y_s1_nj_1040i"
  },
  "us_nyc_tax": {
   "penalty": "Filed and paid on Form IT-201, so the personal income tax penalties apply to the return: late filing 5% of the tax due per month up to 25% (minimum the lesser of $100 or the amount due if more than 60 days late); late payment 0.5% per month up to 25%; plus interest.",
   "penaltySource": "us_y_s1_ny_pitpen",
   "note": "The penalty page is the State's personal income tax page; it does not mention New York City tax by name. The City tax is reported on the same IT-201 and its penalty and interest go on the same line."
  },
  "us_st_pit": {
   "verified": true,
   "source": "us_y_s1_usagov",
   "note": "USA.gov confirms the due date is set by, and published by, each state's tax agency. Of the state resident instructions read in this session, California, New York, Illinois and New Jersey use April 15 and Delaware uses April 30, which agrees with our wording."
  },
  "us_st_nonres": {
   "note": "USA.gov supports 'set by the state'; the claim that the nonresident return is usually due on the same date as the resident return was not checked on any state page in this session, so it stays unconfirmed."
  },
  "us_st_partyear": {
   "note": "USA.gov supports 'set by each state'; 'usually the same date as its resident return' was not checked state by state, so it stays unconfirmed."
  },
  "us_st_est_tax": {
   "note": "No federal or multi-state official page states the state estimated-tax dates; 'most use the federal dates' was not checked state by state. Examples of state estimated-tax penalties read in this session: Delaware 1.5% per month (PIT-RES instructions); California computed at the interest rate for the period late (FTB penalties page)."
  },
  "us_de_cit": {
   "penalty": "Late-filed returns: a penalty of 5% per month, plus interest of 0.5% per month from the original due date until paid. Failure to pay tax shown on a timely filed return: an additional 1% per month, up to 25%.",
   "penaltySource": "us_y_s1_de_cit"
  },
  "us_de_sct": {
   "penalty": "Late returns: a penalty of 5% per month, up to 50% of the tax due, plus interest of 1/2% per month from the original due date until paid. Failure to pay tax shown on a timely filed return: an additional 1% per month, up to 25%. Late or short estimated payments for nonresident shareholders: 1.5% per month.",
   "penaltySource": "us_y_s1_de_sct",
   "dueText": "On or before the 15th day of the 3rd month after the close of the taxable year (March 15 for a calendar year). A federal automatic six-month extension extends the Delaware filing date by six months; it does not extend payment.",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 3,
    "day": 15
   },
   "source": "us_y_s1_de_sct",
   "verified": true,
   "note": "Applies to every corporation that is an S corporation for federal purposes (2025 instructions, revised 11/03/25)."
  },
  "us_de_sales_m": {
   "penalty": "Late returns: a penalty of 5% per month, plus interest of 0.5% per month from the original due date until paid. Failure to pay tax shown on a timely filed return: an additional 1% per month, up to 25%.",
   "penaltySource": "us_y_s1_de_grt"
  },
  "us_de_sales_q": {
   "penalty": "Late returns: a penalty of 5% per month, plus interest of 0.5% per month from the original due date until paid. Failure to pay tax shown on a timely filed return: an additional 1% per month, up to 25%.",
   "penaltySource": "us_y_s1_de_grt"
  },
  "us_de_emp": {
   "penalty": "No penalty for registering late is stated. Once registered, withholding returns filed late carry a penalty of 5% per month plus interest of 0.5% per month from the original due date, and failure to pay tax shown on a timely return an additional 1% per month, up to 25%.",
   "penaltySource": "us_y_s1_de_wh",
   "note": "The penalty quoted is for the withholding returns, not for the registration itself; the unemployment account (Department of Labor) was not researched."
  },
  "us_wy_sales_m": {
   "penalty": "Return not filed on time: the Department may impose a $10 penalty if the return is filed within 30 days of its delinquency notice, or $25 if not filed within 30 days of that notice (it then makes the return itself from the best information available). Underpaid tax carries interest at the average prime rate plus 4% a year (adjusted each January 1, never more than 18%). Deficiency due to negligence: 10% penalty; due to fraud: 25%. The licence can be revoked or suspended.",
   "penaltySource": "us_y_s1_wy_t39",
   "note": "Wyoming Statutes 39-15-108(b) and (c), read in the Legislature's compiled Title 39."
  },
  "us_wy_sales_q": {
   "penalty": "Return not filed on time: the Department may impose a $10 penalty if the return is filed within 30 days of its delinquency notice, or $25 if not filed within 30 days of that notice (it then makes the return itself from the best information available). Underpaid tax carries interest at the average prime rate plus 4% a year (adjusted each January 1, never more than 18%). Deficiency due to negligence: 10% penalty; due to fraud: 25%. The licence can be revoked or suspended.",
   "penaltySource": "us_y_s1_wy_t39",
   "note": "Wyoming Statutes 39-15-108(b) and (c), read in the Legislature's compiled Title 39."
  },
  "us_wy_sales_a": {
   "penalty": "Return not filed on time: the Department may impose a $10 penalty if the return is filed within 30 days of its delinquency notice, or $25 if not filed within 30 days of that notice (it then makes the return itself from the best information available). Underpaid tax carries interest at the average prime rate plus 4% a year (adjusted each January 1, never more than 18%). Deficiency due to negligence: 10% penalty; due to fraud: 25%. The licence can be revoked or suspended.",
   "penaltySource": "us_y_s1_wy_t39",
   "note": "Wyoming Statutes 39-15-108(b) and (c), read in the Legislature's compiled Title 39."
  },
  "us_wy_emp": {
   "penalty": "Unemployment insurance: contributions not paid when due bear interest of 2% per month or part of a month; an employer that has not paid everything or filed every quarterly report by September 30 is assigned a delinquent rate with a 2% increase in its base rate for the next year. Workers' compensation: a payroll report not submitted within 30 days of its due date costs 00 per delinquent report; an employer that does not apply for coverage is liable for all awards to an injured employee.",
   "penaltySource": "us_y_s1_wy_t27",
   "note": "No penalty specifically for registering late was found; the figures are for the reports and payments that follow (W.S. 27-3-503(b), 27-3-510(a), 27-14-202(j), 27-14-203(a))."
  },
  "us_ca_100": {
   "penalty": "Delinquent filing penalty (not paid by the due date and not filed by the extended due date): 5% of the amount due for each month or part of a month unpaid, from the original due date, up to 25%. Late payment: 5% of the unpaid tax plus 0.5% for each month or part of a month unpaid, up to 40 months. Interest also applies.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_100s": {
   "penalty": "Late return: $18 for each shareholder per month, up to 12 months. Tax not paid on time: the delinquent filing penalty of 5% per month up to 25% (when also not filed by the extended due date) and the late payment penalty of 5% of the unpaid tax plus 0.5% per month, up to 40 months. Interest also applies.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_llc_tax": {
   "penalty": "Late payment: 5% of the unpaid amount plus 0.5% for each month or part of a month unpaid, up to 40 months; for an LLC this is computed on the underpaid annual tax, LLC fee and nonconsenting nonresident tax. Interest also applies.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_llc_fee": {
   "penalty": "Estimated fee not paid by the 15th day of the 6th month (at least the lesser of the current year's fee or 100% of the prior year's fee): 10% of the underpaid fee. A fee still unpaid at the return due date also carries the late payment penalty (5% plus 0.5% per month, up to 40 months) and interest.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_568": {
   "penalty": "Late return (LLC treated as a partnership): $18 for each member per month, up to 12 months. Unpaid tax or fee: the late payment penalty of 5% plus 0.5% per month, up to 40 months, and interest.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_568_sm": {
   "penalty": "Delinquent filing penalty (amount due not paid by the due date and return not filed by the extended due date): 5% of the amount due per month or part of a month, up to 25%. Late payment of the $800 annual tax or the LLC fee: 5% of the unpaid amount plus 0.5% per month, up to 40 months. Interest also applies.",
   "penaltySource": "us_y_s1_ca_ftbpen",
   "dueText": "Single-member LLC owned by an individual or a non-pass-through entity: the 15th day of the 4th month after the close of the tax year (extended: 15th day of the 10th month). Owned by an S corporation, or by a partnership or an entity treated as a partnership: the 15th day of the 3rd month after the close of the tax year.",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 4,
    "day": 15
   },
   "source": "us_y_s1_ca_ftbdue",
   "verified": true,
   "note": "The due rule given is for an SMLLC owned by an individual (the case the rule applies to: kind llc or sole_prop). An SMLLC owned by an S corporation or a partnership is due the 15th day of the 3rd month (extended: 9th month if owned by an S corporation, 10th month if owned by a partnership)."
  },
  "us_ca_565": {
   "penalty": "Late return: $18 for each partner per month, up to 12 months. Unpaid tax (limited partnerships and LLPs, $800 annual tax): late payment penalty of 5% plus 0.5% per month, up to 40 months, and interest.",
   "penaltySource": "us_y_s1_ca_ftbpen"
  },
  "us_ca_sales_m": {
   "penalty": "10% penalty for a return not filed by its due date and 10% for a late payment; when both are late the penalty does not exceed 10% of the tax due for the period. Interest is charged for each month or fraction of a month the payment is late.",
   "penaltySource": "us_y_s1_ca_pub75"
  },
  "us_ca_sales_q": {
   "penalty": "10% penalty for a return not filed by its due date and 10% for a late payment; when both are late the penalty does not exceed 10% of the tax due for the period. Interest is charged for each month or fraction of a month the payment is late.",
   "penaltySource": "us_y_s1_ca_pub75"
  },
  "us_ca_sales_a": {
   "penalty": "10% penalty for a return not filed by its due date and 10% for a late payment; when both are late the penalty does not exceed 10% of the tax due for the period. Interest is charged for each month or fraction of a month the payment is late.",
   "penaltySource": "us_y_s1_ca_pub75"
  },
  "us_ca_edd": {
   "penalty": "Failure to register as an employer through intentional disregard or intent to evade: $100 per unreported employee, applied in the assessed quarter with the most unreported employees. Late contributions: 15% of the late contributions; reports filed more than 60 days late: a further 15% of the late contributions and withholding.",
   "penaltySource": "us_y_s1_ca_de231ep",
   "note": "From the EDD penalty reference chart, DE 231EP Rev. 3 (1-26)."
  },
  "us_ny_ct3": {
   "penalty": "Not filed when due (or invalid extension): 5% of the tax per month, up to 25%; if not filed within 60 days of the due date, at least the smaller of $100 or 100% of the tax required to be shown. Tax not paid when due: 0.5% per month, up to 25%. Interest runs from the original due date.",
   "penaltySource": "us_y_s1_ny_ct3i"
  },
  "us_ny_ct3s": {
   "penalty": "Not filed when due (or invalid extension): 5% of the tax per month, up to 25%; if not filed within 60 days, at least the smaller of $100 or 100% of the tax required to be shown. Tax not paid: 0.5% per month, up to 25%. Interest from the original due date. Failure to pay estimated tax on behalf of a shareholder: $50 per shareholder for each failure.",
   "penaltySource": "us_y_s1_ny_ct3si"
  },
  "us_ny_it204": {
   "penalty": "Late return (including extensions), or a return missing required information: $50 for each month or part of a month, up to five months, multiplied by the number of partners during the year who are individuals, estates or trusts subject to New York personal income tax.",
   "penaltySource": "us_y_s1_ny_it204i",
   "note": "The 2025 IT-204-LL instructions state that calendar-year 2025 partnership returns are due March 16, 2026 (March 15 fell on a Sunday)."
  },
  "us_ny_204ll": {
   "penalty": "The instructions say only that failing to file on time or to pay the full fee by the due date may bring penalties and interest; no amount is stated. There is no extension.",
   "penaltySource": "us_y_s1_ny_it204lli",
   "note": "No figure for this penalty was found on an official page; only the stated consequence."
  },
  "us_ny_sales_m": {
   "penalty": "Return with no tax due filed late or not at all: $50. Return up to 60 days late: 10% of the tax due for the first month plus 1% per additional month, up to 30%, minimum $50. Not filed or more than 60 days late: the greater of that amount, the lesser of $100 or 100% of the tax due, or $50. Filed on time but not paid: 10% for the first month plus 1% per month, up to 30%.",
   "penaltySource": "us_y_s1_ny_st805",
   "note": "Tax Bulletin ST-805, issued March 26, 2010."
  },
  "us_ny_sales_q": {
   "penalty": "Return with no tax due filed late or not at all: $50. Return up to 60 days late: 10% of the tax due for the first month plus 1% per additional month, up to 30%, minimum $50. Not filed or more than 60 days late: the greater of that amount, the lesser of $100 or 100% of the tax due, or $50. Filed on time but not paid: 10% for the first month plus 1% per month, up to 30%.",
   "penaltySource": "us_y_s1_ny_st805",
   "note": "Tax Bulletin ST-805, issued March 26, 2010."
  },
  "us_ny_sales_a": {
   "penalty": "Return with no tax due filed late or not at all: $50. Return up to 60 days late: 10% of the tax due for the first month plus 1% per additional month, up to 30%, minimum $50. Not filed or more than 60 days late: the greater of that amount, the lesser of $100 or 100% of the tax due, or $50. Filed on time but not paid: 10% for the first month plus 1% per month, up to 30%.",
   "penaltySource": "us_y_s1_ny_st805",
   "note": "Tax Bulletin ST-805, issued March 26, 2010."
  },
  "us_ny_emp": {
   "penalty": "No penalty for registering late is stated. Once liable: unpaid unemployment insurance contributions carry interest at 12% a year from the due date; a quarterly Form NYS-45 not filed by its due date carries a penalty of the greater of $1,000 or $50 times the number of employees on the last return, up to $10,000 a quarter (abated if filed within 30 days of the certified-mail notice).",
   "penaltySource": "us_y_s1_ny_nys50",
   "note": "The figures are for the quarterly returns and contributions that follow registration, not for the registration itself."
  },
  "us_tx_sales_m": {
   "penalty": "$50 for each report filed after the due date. Tax paid 1-30 days late: 5% penalty; more than 30 days late: 10% penalty. Interest on past-due tax begins 61 days after the due date.",
   "penaltySource": "us_y_s1_tx_sales"
  },
  "us_tx_sales_q": {
   "penalty": "$50 for each report filed after the due date. Tax paid 1-30 days late: 5% penalty; more than 30 days late: 10% penalty. Interest on past-due tax begins 61 days after the due date.",
   "penaltySource": "us_y_s1_tx_sales"
  },
  "us_tx_sales_a": {
   "penalty": "$50 for each report filed after the due date. Tax paid 1-30 days late: 5% penalty; more than 30 days late: 10% penalty. Interest on past-due tax begins 61 days after the due date.",
   "penaltySource": "us_y_s1_tx_sales"
  },
  "us_tx_twc": {
   "penalty": "No penalty for registering late is stated. Late wage reports: $15 if filed within 15 days of the due date; $30 plus 0.05% of unreported wages if filed later in the first month; amounts rising for each further month up to the third month ($30 plus 0.1%, then $30 plus 0.2%, added on). Late contributions: interest of 1.5% per month, up to 37.5% of the contribution. Other violations (records, false reports, rules): $30.",
   "penaltySource": "us_y_s1_tx_tuca213",
   "dueText": "Within 10 days of becoming liable under the Texas Unemployment Compensation Act.",
   "source": "us_y_s1_tx_twcreg",
   "verified": true,
   "note": "The old sourceUrl (programs/unemployment-tax/register-new-account) now returns Page Not Found; the registration page is https://www.twc.texas.gov/services/register-tax. Liability is not simply paying the first employee; the due rule 'When you start paying employees' is close but the official wording is 'within 10 days of becoming liable'. The penalty figures are from the Act as published by TWC (Sec. 213.021 and 213.022)."
  },
  "us_fl_1120": {
   "penalty": "Late return: 10% of any unpaid tax for each month or part of a month late, up to 50% of the unpaid tax. If no tax is due: $50 per month or part of a month, up to $300. A floating rate of interest applies to late payments; underpaid estimated tax carries a 12% per year penalty.",
   "penaltySource": "us_y_s1_fl_corp"
  },
  "us_fl_sales_m": {
   "penalty": "Late return or late payment: a late filing penalty of 10% of the tax owed, but not less than $50; the $50 minimum applies even if no tax is due. A floating rate of interest applies to late payments. Failing to file or pay electronically when required: $10 each, in addition.",
   "penaltySource": "us_y_s1_fl_sales"
  },
  "us_fl_sales_q": {
   "penalty": "Late return or late payment: a late filing penalty of 10% of the tax owed, but not less than $50; the $50 minimum applies even if no tax is due. A floating rate of interest applies to late payments. Failing to file or pay electronically when required: $10 each, in addition.",
   "penaltySource": "us_y_s1_fl_sales"
  },
  "us_fl_sales_a": {
   "penalty": "Late return or late payment: a late filing penalty of 10% of the tax owed, but not less than $50; the $50 minimum applies even if no tax is due. A floating rate of interest applies to late payments. Failing to file or pay electronically when required: $10 each, in addition.",
   "penaltySource": "us_y_s1_fl_sales"
  },
  "us_fl_rt6": {
   "penalty": "Late report: $25 for each 30 days or part of 30 days the report is late. A floating rate of interest applies to late payments. An erroneous or incomplete report: $50 or 10% of tax due, whichever is greater, up to $300 per report. Not filing electronically when required: $25 per report plus $1 per employee, up to $300; not paying electronically: $25 per remittance.",
   "penaltySource": "us_y_s1_fl_rtpay"
  },
  "us_nv_commerce": {
   "penalty": "Late payment: a penalty on a graduated scale of 2% (up to 10 days late), 4% (11-15 days), 6% (16-20 days), 8% (21-30 days) and 10% (more than 30 days) of the tax due, plus interest of 0.75% per month or part of a month. If the Department has to make a determination because no return was filed: a 10% penalty.",
   "penaltySource": "us_y_s1_nv_nac360",
   "note": "NAC 360.395 applies this schedule to taxes under NRS chapters 363A and 363B (Modified Business Tax), 363C (Commerce Tax) and 372 (sales tax), among others; the 0.75% interest and 10% non-filing penalty are in NRS 360.417 and NRS 360.300 (Nevada Legislature). The Commerce Tax FAQ adds that if the tax is paid within an approved extension no penalty is imposed, but interest of 0.75% per month accrues."
  },
  "us_nv_mbt": {
   "penalty": "Late payment: a penalty on a graduated scale of 2% (up to 10 days late), 4% (11-15 days), 6% (16-20 days), 8% (21-30 days) and 10% (more than 30 days) of the tax due, plus interest of 0.75% per month or part of a month. If the Department has to make a determination because no return was filed: a 10% penalty.",
   "penaltySource": "us_y_s1_nv_nac360",
   "note": "NAC 360.395 applies this schedule to taxes under NRS chapters 363A and 363B (Modified Business Tax), 363C (Commerce Tax) and 372 (sales tax), among others; the 0.75% interest and 10% non-filing penalty are in NRS 360.417 and NRS 360.300 (Nevada Legislature)."
  },
  "us_nv_sales_m": {
   "penalty": "Late payment: a penalty on a graduated scale of 2% (up to 10 days late), 4% (11-15 days), 6% (16-20 days), 8% (21-30 days) and 10% (more than 30 days) of the tax due, plus interest of 0.75% per month or part of a month. If the Department has to make a determination because no return was filed: a 10% penalty.",
   "penaltySource": "us_y_s1_nv_nac360",
   "note": "NAC 360.395 applies this schedule to taxes under NRS chapters 363A and 363B (Modified Business Tax), 363C (Commerce Tax) and 372 (sales tax), among others; the 0.75% interest and 10% non-filing penalty are in NRS 360.417 and NRS 360.300 (Nevada Legislature). Note: NRS 360.417 counts interest from the last day of the month following the period; the due date moved to the 20th from the January 2026 period."
  },
  "us_nv_sales_q": {
   "penalty": "Late payment: a penalty on a graduated scale of 2% (up to 10 days late), 4% (11-15 days), 6% (16-20 days), 8% (21-30 days) and 10% (more than 30 days) of the tax due, plus interest of 0.75% per month or part of a month. If the Department has to make a determination because no return was filed: a 10% penalty.",
   "penaltySource": "us_y_s1_nv_nac360",
   "note": "NAC 360.395 applies this schedule to taxes under NRS chapters 363A and 363B (Modified Business Tax), 363C (Commerce Tax) and 372 (sales tax), among others; the 0.75% interest and 10% non-filing penalty are in NRS 360.417 and NRS 360.300 (Nevada Legislature)."
  },
  "us_nv_sales_a": {
   "penalty": "Late payment: a penalty on a graduated scale of 2% (up to 10 days late), 4% (11-15 days), 6% (16-20 days), 8% (21-30 days) and 10% (more than 30 days) of the tax due, plus interest of 0.75% per month or part of a month. If the Department has to make a determination because no return was filed: a 10% penalty.",
   "penaltySource": "us_y_s1_nv_nac360",
   "note": "NAC 360.395 applies this schedule to taxes under NRS chapters 363A and 363B (Modified Business Tax), 363C (Commerce Tax) and 372 (sales tax), among others; the 0.75% interest and 10% non-filing penalty are in NRS 360.417 and NRS 360.300 (Nevada Legislature)."
  },
  "us_wa_excise_m": {
   "penalty": "Tax not received by the due date: a penalty of 9% of the tax; not received by the last day of the month after the due date: 19% in total; not received by the last day of the second month after the due date: 29% in total. No penalty may be less than $5. Interest also applies (the rate changes every year).",
   "penaltySource": "us_y_s1_wa_rcw",
   "note": "From RCW 82.32.090(1) on the Legislature's site; the DOR late-filing page states only that interest rates change every year and that late return penalties can be waived in some circumstances."
  },
  "us_wa_excise_q": {
   "penalty": "Tax not received by the due date: a penalty of 9% of the tax; not received by the last day of the month after the due date: 19% in total; not received by the last day of the second month after the due date: 29% in total. No penalty may be less than $5. Interest also applies (the rate changes every year).",
   "penaltySource": "us_y_s1_wa_rcw",
   "note": "From RCW 82.32.090(1) on the Legislature's site; the DOR late-filing page states only that interest rates change every year and that late return penalties can be waived in some circumstances."
  },
  "us_wa_excise_a": {
   "penalty": "Tax not received by the due date: a penalty of 9% of the tax; not received by the last day of the month after the due date: 19% in total; not received by the last day of the second month after the due date: 29% in total. No penalty may be less than $5. Interest also applies (the rate changes every year).",
   "penaltySource": "us_y_s1_wa_rcw",
   "note": "From RCW 82.32.090(1) on the Legislature's site; the DOR late-filing page states only that interest rates change every year and that late return penalties can be waived in some circumstances."
  },
  "us_wa_sales": {
   "penalty": "Tax not received by the due date: a penalty of 9% of the tax; not received by the last day of the month after the due date: 19% in total; not received by the last day of the second month after the due date: 29% in total. No penalty may be less than $5. Interest also applies (the rate changes every year).",
   "penaltySource": "us_y_s1_wa_rcw",
   "note": "From RCW 82.32.090(1) on the Legislature's site; the DOR late-filing page states only that interest rates change every year and that late return penalties can be waived in some circumstances."
  },
  "us_wa_emp": {
   "penalty": "No penalty for applying late is stated. After registering, the quarterly Workers' Compensation and Unemployment Insurance reports are required every quarter, even with no employees or hours, and failing to submit them results in penalties and interest (no amount stated on this page).",
   "penaltySource": "us_y_s1_wa_hiring",
   "note": "The page says to file the Business License Application for hiring employees no sooner than 90 days before you plan to hire. Penalty figures would be on the Employment Security Department and Labor & Industries sites, which were not read."
  },
  "us_il_1120": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for taxes the Department administers; income tax due must be paid by the original due date even when the filing date is extended."
  },
  "us_il_1120st": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for taxes the Department administers; the publication does not name each return type; it applies to the taxes the Department administers, and has a special note for income tax returns."
  },
  "us_il_1065": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for taxes the Department administers; the publication does not name each return type; it applies to the taxes the Department administers, and has a special note for income tax returns."
  },
  "us_il_sales_m": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for most taxes the Department administers; its late-filing section refers to retailers' returns under the Retailers' Occupation Tax Act and the Use Tax Act (a separate $100 penalty applies to a late zero-tax transaction return)."
  },
  "us_il_sales_q": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for most taxes the Department administers; its late-filing section refers to retailers' returns under the Retailers' Occupation Tax Act and the Use Tax Act (a separate $100 penalty applies to a late zero-tax transaction return)."
  },
  "us_il_sales_a": {
   "penalty": "Late-filing (or non-filing): the lesser of $250 or 2% of the tax required to be shown (reduced by timely payments and credits); if still not filed within 30 days of a notice of non-filing, an additional penalty of the greater of $250 or 2% of the tax shown due, up to $5,000, even when no tax is due. Late payment: 2% if 1-30 days late, 10% if 31 or more days late (higher rates after an audit begins). Interest accrues daily at the federal underpayment rate.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "Publication 103 (September 2025) sets out the uniform penalties for most taxes the Department administers; its late-filing section refers to retailers' returns under the Retailers' Occupation Tax Act and the Use Tax Act (a separate $100 penalty applies to a late zero-tax transaction return)."
  },
  "us_il_emp": {
   "penalty": "No penalty for registering late is stated. Once registered, withholding income tax returns and payments are subject to the uniform penalties: late filing the lesser of $250 or 2% of the tax (a further $250 or 2%, up to $5,000, after a non-filing notice), late payment 2% (1-30 days) or 10% (31+ days), plus interest.",
   "penaltySource": "us_y_s1_il_pub103",
   "note": "The unemployment insurance side (Illinois Department of Employment Security) was not researched."
  },
  "us_nj_cbt": {
   "penalty": "Late filing: 5% per month or part of a month on the underpayment, up to 25%; if no return is filed within 30 days of the first delinquency notice, 5% per month of the total tax liability, up to 25%. A penalty of $100 for each month the return is late may also be imposed. Late payment: 5% of the balance of tax paid after the due date. Interest: 3% above the average predominant prime rate for each month or part of a month unpaid, compounded annually.",
   "penaltySource": "us_y_s1_nj_cbt100i"
  },
  "us_nj_cbt_s": {
   "penalty": "Late filing: 5% per month or part of a month on the underpayment, up to 25%; if no return is filed within 30 days of the first delinquency notice, 5% per month of the total tax liability, up to 25%. A penalty of $100 for each month the return is late may also be imposed. Late payment: 5% of the balance of tax paid after the due date. Interest: 3% above the average predominant prime rate for each month or part of a month unpaid, compounded annually.",
   "penaltySource": "us_y_s1_nj_cbt100si",
   "dueText": "Form CBT-100S: the 15th day of the month following the month the federal corporate income tax return is originally due. For a December 31 year end that is April 15 (for example, 2025 year end: April 15, 2026); if the date falls on a weekend or legal holiday, the next business day.",
   "due": {
    "t": "afterYearEnd",
    "basis": "fy",
    "months": 4,
    "day": 15
   },
   "source": "us_y_s1_nj_cbt100si",
   "verified": true,
   "note": "The 2025 CBT-100S schedule maps every year end to the 15th day of the 4th month after it (July 31 to Nov. 15, Dec. 31 to Apr. 15, June 30 to Oct. 15)."
  },
  "us_nj_1065": {
   "penalty": "Late filing (after the due date or extended due date): 5% per month or part of a month, up to 25% of the outstanding tax liability; a $100 penalty for each month or part of a month late may also be imposed. Late payment: 5% of the outstanding tax balance. Interest: 3% above the prime rate per month or part of a month, compounded annually.",
   "penaltySource": "us_y_s1_nj_1065i"
  },
  "us_nj_st50": {
   "penalty": "If a return is filed late, a late filing penalty of 5% per month (or part of a month), up to 25%, and a $100 penalty for each month or part of a month the return is late may be imposed. If a bill is not paid by its 'Pay By' date, a further 5% late payment penalty applies. Interest runs at 3% above the prime rate for every month or part of a month the tax is unpaid, compounded annually.",
   "penaltySource": "us_y_s2_nj_anj1",
   "note": "Read in the Division of Taxation's Taxpayers' Bill of Rights (ANJ-1), which describes penalties for all state taxes it administers; the sales tax page itself (su_12) states no penalty."
  },
  "us_nj_st51": {
   "penalty": "If a return is filed late, a late filing penalty of 5% per month (or part of a month), up to 25%, and a $100 penalty for each month or part of a month the return is late may be imposed. If a bill is not paid by its 'Pay By' date, a further 5% late payment penalty applies. Interest runs at 3% above the prime rate for every month or part of a month the tax is unpaid, compounded annually.",
   "penaltySource": "us_y_s2_nj_anj1",
   "note": "Read in the Division of Taxation's Taxpayers' Bill of Rights (ANJ-1), which describes penalties for all state taxes it administers; the sales tax page itself (su_12) states no penalty. The 5% per month late filing penalty is described for returns; for a missed monthly payment (ST-51) the late payment penalty and interest are the parts that clearly apply."
  },
  "us_ar_ny_both": {
   "penalty": "No late fee is stated. A corporation or LLC that does not file is shown in Department of State records as past due, and any Certificate of Status will say so, which may prevent some business transactions.",
   "penaltySource": "us_y_s2_ny_bien"
  },
  "us_ar_nj_both": {
   "penalty": "Businesses that fail to file annual reports for two consecutive years may have their charter voided (New Jersey businesses) or their authority to do business in New Jersey revoked. Reinstatement requires filing the past reports and paying a reinstatement fee.",
   "penaltySource": "us_y_s2_nj_reinst",
   "note": "business.nj.gov (the entry's source) refused automated access (Incapsula); the penalty was read on the Division of Revenue's own reinstatement page. No late fee figure was found."
  },
  "us_ar_ar_both": {
   "penalty": "A $25 late filing penalty plus interest (tax and penalty x 0.000274 x number of days late) if the report and tax are not received by May 1 (2026 form).",
   "penaltySource": "us_y_s2_ar_ft",
   "note": "Read on the 2026 LLC franchise tax report form; the corporation form was not opened, though the same instructions cite A.C.A. 26-54-107 and 114 for corporations."
  },
  "us_ar_az_corp": {
   "penalty": "For a for-profit corporation, a penalty of $9.00 per month starts when the deadline is missed (nonprofits are not assessed penalties). The status becomes Pending Inactive; about 60 days after the first delinquency notice a final notice is sent, and about 60 days after that the corporation is administratively dissolved. Reinstatement within six years costs $100 plus past fees and penalties.",
   "penaltySource": "us_y_s2_az_faq",
   "verified": true,
   "source": "us_y_s2_az_faq",
   "note": null
  },
  "us_ar_co_both": {
   "penalty": "A $50 Periodic Report late filing penalty. If the report is not filed by the last day of the second month after the Periodic Report month, the entity becomes Noncompliant and the late fee is assessed; after 60 days as Noncompliant it becomes Delinquent.",
   "penaltySource": "us_y_s2_co_fee",
   "verified": true,
   "source": "us_y_s2_co_status",
   "note": "The status page (co_status) gives the timing: Noncompliant after the due date, Delinquent after 60 days Noncompliant. Our 'due' rule uses the end of the report month itself; the official last day without penalty is the end of the second month after it."
  },
  "us_ar_ct_llc": {
   "penalty": "No late fee was found. If the annual report is not filed, the Secretary of the State may administratively dissolve the business (CGS 33-890 and 34-267g); while the report is overdue the business cannot get a Certificate of Legal Existence. A domestic entity is given three months to file before dissolution.",
   "penaltySource": "us_y_s2_ct_over",
   "note": "ct_admdis: 'If you're a domestic entity, you're given three months to file an annual report and hopefully avoid administrative dissolution.'"
  },
  "us_ar_ct_corp": {
   "penalty": "No late fee was found. If the annual report is not filed, the Secretary of the State may administratively dissolve the business (CGS 33-890 and 34-267g); while the report is overdue the business cannot get a Certificate of Legal Existence. A domestic entity is given three months to file before dissolution.",
   "penaltySource": "us_y_s2_ct_over",
   "note": "ct_admdis: 'If you're a domestic entity, you're given three months to file an annual report and hopefully avoid administrative dissolution.'"
  },
  "us_ar_dc_llc": {
   "penalty": "A $100 biennial report late fee (the report itself is $300), for domestic and foreign LLCs.",
   "penaltySource": "us_y_s2_dc_llcfee"
  },
  "us_ar_dc_corp": {
   "penalty": "A $100 biennial report late fee (the report itself is $300), for domestic and foreign business corporations.",
   "penaltySource": "us_y_s2_dc_corpfee",
   "verified": true,
   "source": "us_y_s2_dc_llc",
   "note": null
  },
  "us_ar_hi_both": {
   "penalty": "A $10.00 late fee for each year the annual report is delinquent; reports due in a quarter must be filed by the end of that quarter to avoid it.",
   "penaltySource": "us_y_s2_hi_q3"
  },
  "us_ar_id_both": {
   "penalty": "The Secretary of State may start administrative dissolution of a domestic entity that does not deliver its annual report by the date it is due. No late fee figure was found.",
   "penaltySource": "us_y_s2_id_601"
  },
  "us_ar_in_both": {
   "penalty": "No late fee is stated. After five months overdue, the business is administratively dissolved (domestic) or revoked (foreign); at least four reminders are sent first. Reinstatement is possible within 5 years.",
   "penaltySource": "us_y_s2_in_ber"
  },
  "us_ar_ks_both": {
   "penalty": "After the due date there is a three-month delinquency period in which the report may still be filed (with limits on other filings). After that the business forfeits and cannot file other documents until it files past-due reports and is reinstated.",
   "penaltySource": "us_y_s2_ks_ir"
  },
  "us_ar_ky_both": {
   "penalty": "The Secretary of State may start administrative dissolution if the entity does not deliver its annual report by the due date. No late fee figure was read.",
   "penaltySource": "us_y_s2_ky_7010",
   "note": "sos.ky.gov refused automated access ('The request is blocked'); read on the Kentucky Revised Statutes site instead."
  },
  "us_ar_la_corp": {
   "penalty": "If a corporation fails for ninety consecutive days to file its annual report, the Secretary of State terminates its existence, after at least 30 days' written notice; filing within the notice period avoids termination.",
   "penaltySource": "us_y_s2_la_1442",
   "note": "Our source for this entry (legis.la.gov d=76392) is R.S. 12:205.1; the business corporation rule in force since 2015 is R.S. 12:1-1621, which also says the report is due 'on or before the anniversary of the date that the corporation was incorporated' (same due date). Consider switching the source to la_1621. The SOS FAQ adds: after a Notice of Intent to Revoke, file within 30 days (60 for a foreign corporation/LLC)."
  },
  "us_ar_la_llc": {
   "penalty": "The Secretary of State revokes the articles of a domestic LLC that fails to file an annual report for three consecutive years (after at least 30 days' notice); reinstatement within three years by filing the current report and an application. The SOS says that after a Notice of Intent to Revoke the report must be filed within 30 days (60 days for a foreign LLC).",
   "penaltySource": "us_y_s2_la_1308_2",
   "verified": true,
   "source": "us_y_s2_la_1308_1",
   "note": null
  },
  "us_ar_me_both": {
   "penalty": "For corporations: a $50 late filing fee in addition to the annual report fee, if the report is not delivered by its due date; if the report, fee or penalty is not filed and paid, a domestic corporation is administratively dissolved and a foreign corporation's authority revoked. Reinstatement after dissolution for failure to file costs $150 (maximum $600).",
   "penaltySource": "us_y_s2_me_1622",
   "note": "Amount from 13-C MRSA 123(1)(EE): 'For failing to deliver an annual report by its due date, in addition to the annual report filing fee, the fee is $50.' These are the Business Corporation Act provisions; the LLC penalty (Title 31) was not read. maine.gov SOS refused automated access (CloudFront 403)."
  },
  "us_ar_md_both": {
   "penalty": "A return postmarked after April 15 gets an initial penalty of 1/10 of one percent of the county assessment, plus interest of 2% of the initial penalty for each 30 days or part of 30 days late (2025 Form 1). Entities that do not file get estimated assessments of twice the estimated property value, and failure to file results in forfeiture of the Maryland charter or right to do business.",
   "penaltySource": "us_y_s2_md_f1",
   "note": "The SDAT instructions file at the 2024 URL (headed 'Form 1 Instructions 2020') add a minimum base penalty of $30 (1-15 days late), $40 (16-30), $50 (31+) and a maximum of $500, 'whichever is greater'; the 2025 form does not repeat the base amounts."
  },
  "us_ar_mi_llc": {
   "penalty": "If an LLC fails to file its annual statement for 2 consecutive years, the administrator sends a notice; if the statements and fees are not filed within 60 days, the LLC is not in good standing (no certificate of good standing, its name becomes available to others, and no other filings are accepted). No late fee for ordinary LLCs was found.",
   "penaltySource": "us_y_s2_mi_4207a",
   "note": "michigan.gov refused automated access (Access Denied); read in the Michigan Compiled Laws."
  },
  "us_ar_mi_corp": {
   "penalty": "If a domestic corporation does not file its annual report or pay the fee or penalty for 2 years from the due date, it is automatically dissolved 60 days after the 2-year period (notice at least 90 days before). A foreign corporation's certificate of authority is subject to revocation after 1 year. The late-fee amount was not read.",
   "penaltySource": "us_y_s2_mi_1922",
   "note": "michigan.gov refused automated access; read in the Michigan Compiled Laws. MCL 450.1922 refers to 'a penalty added to the fee' but its amount was not read."
  },
  "us_ar_mn_both": {
   "penalty": "No fee is stated. If the annual renewal is missed, the business is administratively dissolved (no longer active in Minnesota) and must be reinstated, which requires a current renewal and a fee.",
   "penaltySource": "us_y_s2_mn_ren"
  },
  "us_ar_mo_corp": {
   "penalty": "The Secretary of State may administratively dissolve a corporation that does not deliver its registration report within 90 days after it is due (after a 60-day notice to correct).",
   "penaltySource": "us_y_s2_mo_351484",
   "verified": true,
   "source": "us_y_s2_mo_351120",
   "note": "sos.mo.gov refused automated access (Cloudflare challenge); read on the Missouri Revisor of Statutes site. A corporation may change its filing month for a $20 fee (351.120.8)."
  },
  "us_ar_mt_both": {
   "penalty": "The annual report fee is waived if filed January 1 to April 15; after April 15 the fee is $35. The page adds that foreign entities must file by November 1 and domestic entities by December 1.",
   "penaltySource": "us_y_s2_mt_ar",
   "note": "The page does not say what happens after the November 1 / December 1 dates."
  },
  "us_ar_ne_corp": {
   "penalty": "If the report is not filed by the delinquency date (April 15 of the even year), the corporation is administratively dissolved or its authority revoked; it may reinstate by filing reinstatement forms.",
   "penaltySource": "us_y_s2_ne_ar"
  },
  "us_ar_ne_llc": {
   "penalty": "If the report is not filed by the delinquency date (June 16 of the odd year), the LLC is administratively dissolved or its authority revoked; it may reinstate by filing reinstatement forms.",
   "penaltySource": "us_y_s2_ne_ar"
  },
  "us_ar_nc_llc": {
   "penalty": "No late fee was found. The Secretary of State may administratively dissolve an LLC that does not deliver its annual report on or before the 60th day after it is due, if it does not correct this within 60 days after the notice is mailed.",
   "penaltySource": "us_y_s2_nc_57d"
  },
  "us_ar_nc_corp": {
   "penalty": "No late fee was found. The Secretary of State may start administrative dissolution of a corporation that is delinquent in delivering its annual report.",
   "penaltySource": "us_y_s2_nc_551420",
   "note": "The SOS notice (nc_admdis) confirms the due date: 'Annual reports are due on the 15th day of the fourth month following the fiscal year end.'"
  },
  "us_ar_nd_corp_here": {
   "penalty": "A late filing fee applies if the report is not received by the deadline (amount not stated on the page). The business is placed in Not Good Standing and is typically involuntarily dissolved or terminated (a foreign business's authority revoked) if the past-due report is not filed within 6 to 12 months; it has 1 year to reinstate.",
   "penaltySource": "us_y_s2_nd_mr",
   "note": "The late fee amount is not on the page."
  },
  "us_ar_nd_corp_other": {
   "penalty": "A late filing fee applies if the report is not received by the deadline (amount not stated on the page). The business is placed in Not Good Standing and is typically involuntarily dissolved or terminated (a foreign business's authority revoked) if the past-due report is not filed within 6 to 12 months; it has 1 year to reinstate.",
   "penaltySource": "us_y_s2_nd_mr",
   "note": "The late fee amount is not on the page."
  },
  "us_ar_nd_llc": {
   "penalty": "A late filing fee applies if the report is not received by the deadline (amount not stated on the page). The business is placed in Not Good Standing and is typically involuntarily dissolved or terminated (a foreign business's authority revoked) if the past-due report is not filed within 6 to 12 months; it has 1 year to reinstate.",
   "penaltySource": "us_y_s2_nd_mr",
   "note": "The late fee amount is not on the page."
  },
  "us_ar_or_both": {
   "penalty": "A business that does not file its annual report is administratively dissolved. It can be reinstated (online if dissolved for less than 5 years) by paying a reinstatement fee and the missed annual fees.",
   "penaltySource": "us_y_s2_or_reinst",
   "note": "The page does not say how long after the due date dissolution happens, and gives no fee amounts."
  },
  "us_ar_pa_corp": {
   "penalty": "No late fee is stated. Failure to file subjects a domestic entity to administrative dissolution (a foreign one to termination of its registration) and loss of its name, but only beginning with annual reports due in 2027 and not filed in 2027 (transition period under Act 122). Reinstatement requires a fee and a fee for each missed report.",
   "penaltySource": "us_y_s2_pa_ar"
  },
  "us_ar_pa_llc": {
   "penalty": "No late fee is stated. Failure to file subjects a domestic entity to administrative dissolution (a foreign one to termination of its registration) and loss of its name, but only beginning with annual reports due in 2027 and not filed in 2027 (transition period under Act 122). Reinstatement requires a fee and a fee for each missed report.",
   "penaltySource": "us_y_s2_pa_ar"
  },
  "us_ar_ri_both": {
   "penalty": "A $25 late filing penalty, applied June 1, for business corporations and LLCs (filing period February 1 to May 1).",
   "penaltySource": "us_y_s2_ri_ar"
  },
  "us_ar_vt_corp": {
   "penalty": "A corporation that fails to file its annual report is terminated (involuntary termination); filing the report with the fee reinstates its charter retroactively. It loses the right to keep its name if the report is not filed within five years of the due date and another entity takes the name.",
   "penaltySource": "us_y_s2_vt_1420",
   "note": "sos.vermont.gov refused automated access (CloudFront 403); read in the Vermont Statutes. No late fee was read. 11A 16.22(c) confirms our due date ('within two and one-half months after the expiration of the corporation's fiscal year')."
  },
  "us_ar_vt_llc": {
   "penalty": "The articles of organization of an LLC that fails to file its annual report terminate (a foreign LLC's certificate of authority terminates); filing the report with the fee allows reinstatement.",
   "penaltySource": "us_y_s2_vt_4034",
   "note": "sos.vermont.gov refused automated access; read in the Vermont Statutes. 11 V.S.A. 4033(c) confirms our due date ('within three months after the expiration of the company's fiscal year')."
  },
  "us_ar_va_both": {
   "penalty": "Corporations: if the annual registration fee is not paid by the due date, a penalty of 10% of the fee (at least $10); if the fee is not paid or the report not filed by the last day of the fourth month after the due date, the corporation's existence is terminated (a foreign corporation's authority revoked). LLCs: a $25 penalty if the fee is late; existence (or registration) cancelled if not paid by the last day of the third month after the due date. Reinstatement possible within five years.",
   "penaltySource": "us_y_s2_va_mb"
  },
  "us_ar_wv_both": {
   "penalty": "An administrative late fee of $50 for an annual delinquency ($100 for a biennial delinquency; $25/$50 for nonprofits), plus dissolution or revocation after a certified-mail notice posted at least 30 days before the date. The Secretary of State may waive or reduce the late fee for circumstances beyond the filer's control.",
   "penaltySource": "us_y_s2_wv_code",
   "note": "The SOS page (sos.wv.gov annual reports) says: 'Failure to file by the June 30 deadline may result in monetary penalties as well as administrative dissolution or revocation.' The statute says the annual report fee is $25 after July 1, 2026."
  },
  "us_ar_wi_both_here": {
   "penalty": "No late fee is stated. An entity that does not file becomes Delinquent; it cures this by filing a current report and paying back report fees. Entities that fail to file after several years may be administratively dissolved.",
   "penaltySource": "us_y_s2_wi_faq"
  },
  "us_ar_wi_both_other": {
   "penalty": "Foreign entities that do not file within four months of the March 31 due date may have their certificate of authority or registration revoked or terminated.",
   "penaltySource": "us_y_s2_wi_faq"
  },
  "us_ar_ak_both": {
   "penalty": "Corporations: a penalty of 10% of the corporation tax assessed for the period if the biennial report is not filed on time, and $25 for each year or part of a year the biennial corporation tax ($100 domestic, $200 foreign) is paid after February 1. A corporation or LLC delinquent six months in filing its biennial report (or paying a tax, fee or penalty) may be involuntarily dissolved by the commissioner.",
   "penaltySource": "us_y_s2_ak_corp",
   "verified": true,
   "source": "us_y_s2_ak_corp",
   "note": "AS 10.50 (ak_llc) has the same due rule for LLCs ('due before January 2 of the filing year', even/odd by year of formation) and dissolution after six months' delinquency; mailing proof by February 1 counts as compliance. The statute says 'before January 2' (i.e. by January 1); our text says 'due January 2'. The Alaska commerce site refused automated access (403, JavaScript check)."
  },
  "us_ar_ga_both": {
   "penalty": "A $25 late fee if not filed (postmarked) by April 1; an entity that does not file or pay may be administratively dissolved or revoked by the Secretary of State.",
   "penaltySource": "us_y_s2_ga_llc",
   "verified": true,
   "source": "us_y_s2_ga_corp",
   "note": "sos.ga.gov refused automated access (Cloudflare); read on georgia.gov. A corporation's FIRST registration is due within 90 days of incorporation, which our text does not mention."
  },
  "us_ar_ia_corp": {
   "penalty": "The Secretary of State may administratively dissolve a corporation that does not deliver its biennial report within sixty days after it is due. No late fee was read.",
   "penaltySource": "us_y_s2_ia_490_1420",
   "verified": true,
   "source": "us_y_s2_ia_490_1621",
   "note": "sos.iowa.gov refused automated access (Cloudflare); read in the Iowa Code (2026)."
  },
  "us_ar_ia_llc": {
   "penalty": "The Secretary of State may administratively dissolve an LLC that does not deliver its biennial report within sixty days after it is due. No late fee was read.",
   "penaltySource": "us_y_s2_ia_489_708",
   "verified": true,
   "source": "us_y_s2_ia_489_212",
   "note": "sos.iowa.gov refused automated access; read in the Iowa Code (2026)."
  },
  "us_ar_ma_llc": {
   "penalty": "The state secretary may start administrative dissolution of an LLC that has failed for 2 consecutive years to file annual reports; it is dissolved if it does not correct this within 90 days after notice. No late fee was read.",
   "penaltySource": "us_y_s2_ma_156c70",
   "verified": true,
   "source": "us_y_s2_ma_tip",
   "note": "sec.state.ma.us could not be read (redirect loop); read on mass.gov and malegislature.gov. 950 CMR 112.14 says the same."
  },
  "us_ar_ma_corp": {
   "penalty": "The Secretary of State may administratively dissolve a corporation that has failed to file required reports (or tax returns or taxes under c.62C/63) for 2 or more consecutive years. No late fee was read.",
   "penaltySource": "us_y_s2_ma_156d1420",
   "verified": true,
   "source": "us_y_s2_ma_156d1622",
   "note": null
  },
  "us_ar_nh_both": {
   "penalty": "For corporations: a $50 late filing fee if the annual report or fee is not filed by April 1; the Secretary of State may start administrative dissolution if the report is not delivered for 12 months after it is due.",
   "penaltySource": "us_y_s2_nh_122",
   "verified": true,
   "source": "us_y_s2_nh_136",
   "note": "Read in the Business Corporation Act (RSA 293-A:1.36, 1.22(a)(17) and 14.20(a)(2): 'the corporation does not deliver its annual report to the secretary of state for 12 months after it is due'). The LLC statute (RSA 304-C) was not read. sos.nh.gov refused automated access (Access Denied); gc.nh.gov pages were read through a page-summarising fetch, so quotations are short."
  },
  "us_ar_sd_both": {
   "penalty": "An additional fee of $50 for delinquent reports (on top of the $65 filing fee, domestic LLC form).",
   "penaltySource": "us_y_s2_sd_ar",
   "note": "From January 1, 2027 (SL 2026, ch 203) SDCL 59-11-25 changes: an entity files 'In the month representing the first-year anniversary of the entity's formation and in each same month annually thereafter' OR, if it so elects on its formation document or a change-of-filing-date form, 'on or before January thirty-first' each year. The current wording read on the page does not match our 'anniversary month' text, but the 2027 version largely does; we did not resolve how the Secretary of State applies the current wording, so no correction is proposed."
  },
  "us_ar_ut_both": {
   "penalty": "A $10 late renewal fee (renewal itself $18, FY2026 schedule). If the business still does not renew after the delinquency notice it expires; reinstatement costs $18 for each missed year plus a $10 delinquency fee.",
   "penaltySource": "us_y_s2_ut_fees",
   "verified": true,
   "source": "us_y_s2_ut_renpdf",
   "note": "The renewal form is a 2021 file; the postcard FAQ (ut_postcard) also ties the renewal notice to the anniversary date. The number of days between delinquency and expiration was not stated."
  },
  "us_oh_cat": {
   "penalty": "A penalty of up to the greater of $50 or 10% of the tax due for the period for failing to file a return or pay the full tax on time; up to 15% on additional tax found due; up to 35% if a person told to register does not register and remit within 60 days; up to 10% for incorrectly reported receipts; plus interest at the rate set under R.C. 5703.47 from the due date.",
   "penaltySource": "us_y_s2_oh_5751_06",
   "dueText": "A return for each calendar quarter, filed no later than the tenth day of the second month after the end of the quarter. The fourth-quarter return is the annual return.",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "quarterly",
    "basis": "cal",
    "months": 2,
    "day": 10
   },
   "source": "us_y_s2_oh_5751_051",
   "note": "tax.ohio.gov refused automated access (403); read in the Ohio Revised Code (version effective October 3, 2023). The $6 million exclusion in our text was not read in this session."
  }
 }
};
