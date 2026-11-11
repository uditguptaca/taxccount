// The non-tax duties of United States: company registry, employment, workplace safety, privacy and so on.
// WRITTEN BY scripts/compliance-import.ts from research read on the official pages on 2026-11-11. Do not edit by hand:
// change it in Service Master (which then owns the row), or re-run the importer with a corrected research file.
import type { More } from '../more.ts';

export const more: More = {
 "version": "2026-11-11",
 "step": {
  "id": "ops",
  "title": "Running the business",
  "desc": "Tick what is true for the business. Each tick can add a duty outside tax: staff, records, licences, registers.",
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
  }
 ]
};
