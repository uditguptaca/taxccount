// The non-tax duties of India: company registry, employment, workplace safety, privacy and so on.
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
   "id": "fema",
   "name": "Foreign investment and foreign trade (RBI, DGFT)",
   "desc": "Reports to the Reserve Bank on foreign investment, overseas investment and foreign loans, export proceeds, and the yearly update of the Importer-Exporter Code."
  },
  {
   "id": "labour",
   "name": "Labour and workplace",
   "desc": "Wage payment dates, the yearly workplace-harassment report, and State shop and establishment registration and returns."
  },
  {
   "id": "licences",
   "name": "Licences, registrations and data",
   "desc": "Food licence, packaged goods registration, trade mark renewal, cyber incident and personal data duties, and other sector-neutral registrations."
  }
 ],
 "questions": [
  {
   "id": "in_x_fdi",
   "step": "ops",
   "text": "Does a person or company resident outside India hold shares in the business, or a capital contribution in the LLP?",
   "type": "yn",
   "help": "Foreign direct investment that is still outstanding on 31 March. Share application money alone, and shares issued on a non-repatriable basis, do not count.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc",
       "partnership",
       "sole_prop"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_odi",
   "step": "ops",
   "text": "Have you invested in a company or business outside India (overseas direct investment)?",
   "type": "yn",
   "help": "For example a foreign subsidiary or joint venture, or 10% or more of the equity of a foreign entity. Listed foreign shares bought as a portfolio investment are not meant here.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "corporation",
       "llc",
       "partnership",
       "sole_prop"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_nr_issue",
   "step": "ops",
   "text": "Did it issue shares or other equity instruments to a person resident outside India, or (for an LLP) receive a capital contribution from one?",
   "type": "yn",
   "help": "Each allotment to a foreign investor is reported to the Reserve Bank through the company's bank.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_nr_transfer",
   "step": "ops",
   "text": "Did you buy shares of an Indian company from a person resident outside India, or sell them to one?",
   "type": "yn",
   "help": "A transfer of equity instruments between a resident and a non-resident. The resident buyer or seller reports it.",
   "show": {
    "all": [
     {
      "kind": [
       "individual",
       "corporation",
       "llc",
       "partnership"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_llp_nr_transfer",
   "step": "ops",
   "text": "Was a capital contribution or profit share in the LLP transferred between a resident and a non-resident?",
   "type": "yn",
   "help": "In either direction: a non-resident partner coming in by buying a resident partner's share, or leaving by selling it.",
   "show": {
    "all": [
     {
      "kind": [
       "llc"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_downstream",
   "step": "ops",
   "text": "Is it foreign owned or controlled, and did it invest in another Indian company or LLP?",
   "type": "yn",
   "help": "A downstream investment by an Indian entity that itself has foreign investment counts as indirect foreign investment in the entity it invests in.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_esop_nr",
   "step": "ops",
   "text": "Did the company issue employee stock options to employees or directors who are resident outside India?",
   "type": "yn",
   "help": "Including employees or directors of its holding company, joint venture or overseas subsidiaries.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_ecb",
   "step": "ops",
   "text": "Has it borrowed from a lender outside India (an external commercial borrowing)?",
   "type": "yn",
   "help": "A loan, bond or other debt raised from a recognised non-resident lender, such as a foreign parent or a foreign bank.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_exporter",
   "step": "ops",
   "text": "Do you export goods or services?",
   "type": "yn",
   "help": "Selling goods or services to customers outside India, whether or not you are registered for GST.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_iec",
   "step": "ops",
   "text": "Do you hold an Importer-Exporter Code (IEC)?",
   "type": "yn",
   "help": "The 10-character code from the Directorate General of Foreign Trade that is needed to import or export.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "fema"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_new_co",
   "step": "ops",
   "text": "Was the company incorporated within the last 12 months?",
   "type": "yn",
   "help": "New companies with a share capital must file a declaration before they start business or borrow.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "mca"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_charge",
   "step": "ops",
   "text": "Did the company give security for a loan this year (create or change a charge on its assets)?",
   "type": "yn",
   "help": "For example a mortgage, hypothecation or pledge in favour of a bank or other lender.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "mca"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_resolution",
   "step": "ops",
   "text": "Did the company pass a special resolution, or another resolution or agreement that must be filed with the Registrar?",
   "type": "yn",
   "help": "For example a change to the articles, a change of name or objects, or a board resolution of a kind the Act lists.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "mca"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_dir_change",
   "step": "ops",
   "text": "Was a director or key managerial person appointed, or did one resign or change, this year?",
   "type": "yn",
   "help": "Each appointment and each change is notified to the Registrar.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "mca"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_csr",
   "step": "ops",
   "text": "Does the company have a net worth of Rs 500 crore or more, a turnover of Rs 1,000 crore or more, or a net profit of Rs 5 crore or more?",
   "type": "yn",
   "help": "Above any one of these the corporate social responsibility (CSR) provisions apply.",
   "show": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "dept": [
       "mca"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_food",
   "step": "ops",
   "text": "Is it a food business with an FSSAI licence or registration?",
   "type": "yn",
   "help": "Making, packing, storing, transporting, selling, serving or importing food. Small operators with turnover up to Rs 12 lakh hold a registration; larger ones hold a licence.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_food_mfr",
   "step": "ops",
   "text": "Does it manufacture, repack or relabel food, or import food, under an FSSAI licence?",
   "type": "yn",
   "help": "Licensed manufacturers (including those who have products made for them by others), importers and manufacturer-exporters file a yearly return. Holders of a registration certificate do not.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_prepack",
   "step": "ops",
   "text": "Do you pre-pack goods for sale, or import packaged goods?",
   "type": "yn",
   "help": "Putting any commodity into a package for sale, distribution or delivery, or importing such packages.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_trademark",
   "step": "ops",
   "text": "Do you own a registered trade mark?",
   "type": "yn",
   "help": "A mark entered on the register of the Trade Marks Registry, not one that is only applied for.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     }
    ]
   }
  },
  {
   "id": "in_x_tm_expiry",
   "step": "ops",
   "text": "On what date does the current trade mark registration expire?",
   "type": "date",
   "help": "It is ten years from the date of registration and is shown on the registration or renewal certificate. Leave it blank if you do not know.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit",
       "individual"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     },
     {
      "q": "in_x_trademark",
      "yes": true
     }
    ]
   },
   "optional": true
  },
  {
   "id": "in_x_personal_data",
   "step": "ops",
   "text": "Do you collect or use personal data of individuals in digital form?",
   "type": "yn",
   "help": "Names, phone numbers, addresses, identity or payment details of customers, users or employees held on a computer, app or website.",
   "show": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit"
      ]
     },
     {
      "dept": [
       "licences"
      ]
     }
    ]
   }
  }
 ],
 "compliances": [
  {
   "id": "in_x_fla",
   "name": "Annual return on foreign liabilities and assets",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "A yearly return to the Reserve Bank by every Indian entity that has foreign direct investment in it, or has invested in a business abroad. It can be filed on unaudited figures and revised later.",
   "why": "The business has foreign investment in it, or has an investment abroad, outstanding at the end of March.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc",
       "partnership",
       "sole_prop"
      ]
     },
     {
      "any": [
       {
        "q": "in_x_fdi",
        "yes": true
       },
       {
        "q": "in_x_odi",
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
      7,
      15
     ]
    ]
   },
   "dueText": "By 15 July of the reporting year, on audited or unaudited financials.",
   "weight": 78,
   "source": "in_x_src_fla",
   "verified": true,
   "form": "FLA Return (on the RBI's FLAIR portal)",
   "penalty": "Non-filing of the return before the due date is treated as a violation of FEMA and the penalty clause may be invoked. Late Submission Fee of Rs 7,500. Non-filing is treated as a violation of FEMA.",
   "note": "A return filed after 15 July needs the Reserve Bank's approval first.",
   "roll": false
  },
  {
   "id": "in_x_fcgpr",
   "name": "Report shares issued to a foreign investor",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "An Indian company that issues shares or other equity instruments to a person resident outside India reports each issue to the Reserve Bank through its bank.",
   "why": "The company issued equity instruments to a person resident outside India.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_nr_issue",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than thirty days from the date of issue of the equity instruments"
   },
   "dueText": "Not later than thirty days from the date of issue of equity instruments.",
   "weight": 80,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form FC-GPR",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_llp1",
   "name": "Report a foreign capital contribution to an LLP",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "An LLP that receives money from a person resident outside India for a capital contribution and share of profits reports it to the Reserve Bank.",
   "why": "The LLP received a capital contribution from a person resident outside India.",
   "applies": {
    "all": [
     {
      "entity": [
       "llp"
      ]
     },
     {
      "q": "in_x_nr_issue",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days from the date of receipt of the amount of consideration"
   },
   "dueText": "Within 30 days from the date of receipt of the amount of consideration.",
   "weight": 78,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form LLP (I)",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_fctrs",
   "name": "Report a share transfer between a resident and a non-resident",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "When shares of an Indian company pass between a resident and a person resident outside India, the resident buyer or seller reports the transfer to the Reserve Bank through a bank.",
   "why": "You bought shares of an Indian company from a non-resident, or sold them to one.",
   "applies": {
    "q": "in_x_nr_transfer",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within sixty days of the transfer of the equity instruments or of the receipt or remittance of funds, whichever is earlier"
   },
   "dueText": "Within sixty days of transfer of equity instruments or receipt / remittance of funds, whichever is earlier.",
   "weight": 76,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form FC-TRS",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_llp2",
   "name": "Report a transfer of an LLP share between a resident and a non-resident",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "A disinvestment or transfer of capital contribution or profit share in an LLP between a resident and a non-resident, in either direction, is reported by the resident party.",
   "why": "A capital contribution or profit share in the LLP moved between a resident and a non-resident.",
   "applies": {
    "all": [
     {
      "entity": [
       "llp"
      ]
     },
     {
      "q": "in_x_llp_nr_transfer",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 60 days from the date of receipt of funds"
   },
   "dueText": "Within 60 days from the date of receipt of funds.",
   "weight": 70,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form LLP (II)",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_form_di",
   "name": "Report a downstream investment",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "An Indian entity that itself has foreign investment and invests in another Indian entity reports that downstream investment, which counts as indirect foreign investment.",
   "why": "It is foreign owned or controlled and invested in another Indian entity.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "q": "in_x_downstream",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days from the date of allotment of the equity instruments"
   },
   "dueText": "Within 30 days from the date of allotment of equity instruments.",
   "weight": 68,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form DI",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_form_esop",
   "name": "Report stock options issued to non-resident employees",
   "dept": "fema",
   "head": "Foreign investment reporting",
   "authority": "Reserve Bank of India",
   "brief": "An Indian company that issues employee stock options to employees or directors resident outside India reports the issue to the Reserve Bank.",
   "why": "The company issued stock options to employees or directors resident outside India.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_esop_nr",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 30 days from the date of issue of the employees' stock option"
   },
   "dueText": "Within 30 days from the date of issue of employees' stock option.",
   "weight": 60,
   "source": "in_x_src_fema395",
   "verified": true,
   "form": "Form ESOP",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_ecb_lrn",
   "name": "Get a loan registration number before drawing a foreign loan",
   "dept": "fema",
   "head": "Foreign borrowing",
   "authority": "Reserve Bank of India",
   "brief": "Before any money is drawn under an external commercial borrowing, the borrower reports the loan terms through its bank and obtains a Loan Registration Number (LRN) from the Reserve Bank. Later changes to the terms are reported on a revised form.",
   "why": "It has borrowed, or is about to borrow, from a lender outside India.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "q": "in_x_ecb",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Before the first draw-down of the loan; changes in terms not later than 7 days after they take effect"
   },
   "dueText": "Any draw-down should happen only after obtaining the LRN from the Reserve Bank. Changes in the loan terms: a revised Form ECB not later than 7 days from the changes effected.",
   "weight": 72,
   "source": "in_x_src_ecb",
   "verified": true,
   "form": "Form ECB",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "roll": false
  },
  {
   "id": "in_x_ecb2",
   "name": "Monthly return on a foreign loan",
   "dept": "fema",
   "head": "Foreign borrowing",
   "authority": "Reserve Bank of India",
   "brief": "A borrower with an external commercial borrowing reports the actual transactions under the loan every month, through its bank, to the Reserve Bank's statistics department.",
   "why": "It has an external commercial borrowing outstanding.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation",
       "llc"
      ]
     },
     {
      "q": "in_x_ecb",
      "yes": true
     }
    ]
   },
   "frequency": "monthly",
   "due": {
    "t": "event",
    "text": "Within seven working days from the close of each month"
   },
   "dueText": "So as to reach the Reserve Bank within seven working days from the close of the month to which it relates.",
   "weight": 74,
   "source": "in_x_src_ecb",
   "verified": true,
   "form": "Form ECB 2 Return",
   "penalty": "Late Submission Fee of Rs 7,500 plus 0.025% of the amount involved for each year of delay, capped at 100% of the amount. The option to pay it is open for three years from the due date.",
   "note": "A borrower that has not filed its returns for eight quarters or more can be treated as untraceable, and its bank will not process a fresh borrowing.",
   "roll": false
  },
  {
   "id": "in_x_odi_fc",
   "name": "Report an overseas investment when it is made",
   "dept": "fema",
   "head": "Overseas investment",
   "authority": "Reserve Bank of India",
   "brief": "A resident who makes an overseas direct investment, or any other financial commitment to a foreign entity, reports it through a bank and obtains a Unique Identification Number.",
   "why": "You have invested, or are about to invest, in a business outside India.",
   "applies": {
    "q": "in_x_odi",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "At the time of sending the outward remittance or making the financial commitment, whichever is earlier"
   },
   "dueText": "At the time of sending outward remittance or making a financial commitment, whichever is earlier. Form FC goes to the bank on or before making the initial investment.",
   "weight": 72,
   "source": "in_x_src_fema400",
   "verified": true,
   "form": "Form FC",
   "penalty": "A delayed report may be filed with a Late Submission Fee for up to three years from the due date. Until the delay is regularised, no further financial commitment may be made to that foreign entity.",
   "roll": false
  },
  {
   "id": "in_x_odi_apr",
   "name": "Annual performance report on an overseas investment",
   "dept": "fema",
   "head": "Overseas investment",
   "authority": "Reserve Bank of India",
   "brief": "A resident who holds an overseas direct investment files a yearly report on each foreign entity, based on its accounts. Where a statutory audit does not apply, a chartered accountant certifies it.",
   "why": "You hold an investment in a business outside India.",
   "applies": {
    "q": "in_x_odi",
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
    ]
   },
   "dueText": "Every year by 31 December. Where the foreign entity's accounting year ends on 31 December, by 31 December of the next year.",
   "weight": 76,
   "source": "in_x_src_fema400",
   "verified": true,
   "form": "Annual Performance Report (APR)",
   "penalty": "Late Submission Fee of Rs 7,500. Non-filing is treated as a violation of FEMA. Until the delay is regularised, no further financial commitment may be made to that foreign entity.",
   "roll": false
  },
  {
   "id": "in_x_export_realise",
   "name": "Bring export proceeds back to India in time",
   "dept": "fema",
   "head": "Exports",
   "authority": "Reserve Bank of India",
   "brief": "An exporter declares each export of goods in the Export Declaration Form and must realise the full export value and bring it to India within the period the Reserve Bank sets. A bank can extend the period on request.",
   "why": "You export goods or services.",
   "applies": {
    "q": "in_x_exporter",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within nine months from the date of shipment (goods) or of invoice (services); twelve months when invoiced or settled in Indian Rupees"
   },
   "dueText": "Nine months from the date of shipment in case of goods and from the date of invoice in case of services; twelve months where the export is invoiced or settled in Indian Rupees.",
   "weight": 70,
   "source": "in_x_src_fema23",
   "verified": true,
   "form": "Export Declaration Form (EDF), with the shipping bill",
   "penalty": "If proceeds remain unrealised beyond one year from the due date, further exports may be made only against full advance payment or an irrevocable letter of credit.",
   "note": "These regulations took effect on 1 October 2026. The periods were fifteen and eighteen months until a September 2026 amendment cut them to nine and twelve; check the current text before relying on them.",
   "roll": false
  },
  {
   "id": "in_x_iec_update",
   "name": "Update the Importer-Exporter Code every year",
   "dept": "fema",
   "head": "Imports and exports",
   "authority": "Directorate General of Foreign Trade",
   "brief": "Every holder of an Importer-Exporter Code confirms or updates its details online once a year, even when nothing has changed.",
   "why": "You hold an Importer-Exporter Code.",
   "applies": {
    "q": "in_x_iec",
    "yes": true
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
   "dueText": "Every year, during the April to June period.",
   "weight": 75,
   "source": "in_x_src_ftp2",
   "verified": true,
   "form": "IEC updation on the DGFT portal",
   "penalty": "An IEC that is not updated within the period is de-activated. It is activated again once it is updated.",
   "roll": false
  },
  {
   "id": "in_x_inc20a",
   "name": "Declaration before a new company starts business",
   "dept": "mca",
   "head": "Company filings",
   "authority": "Ministry of Corporate Affairs",
   "brief": "A new company with a share capital cannot start business or borrow until a director files a declaration that every subscriber has paid for the shares they agreed to take, and the registered office has been verified.",
   "why": "The company was incorporated in the last 12 months.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_new_co",
      "yes": true
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within 180 days of the date of incorporation"
   },
   "dueText": "Within a period of one hundred and eighty days of the date of incorporation of the company.",
   "weight": 82,
   "source": "in_x_src_caa2019",
   "verified": true,
   "form": "INC-20A",
   "penalty": "Penalty of Rs 50,000 on the company, and Rs 1,000 a day (up to Rs 1,00,000) on each officer in default. The Registrar may also start removing the company's name from the register.",
   "note": "The form number INC-20A is the name given in your brief; it was not read on an official page. The time limit and penalty were read in the 2019 amending Act as passed; later changes to the penalty were not checked.",
   "roll": false
  },
  {
   "id": "in_x_chg1",
   "name": "Register a charge on the company's assets",
   "dept": "mca",
   "head": "Company filings",
   "authority": "Ministry of Corporate Affairs",
   "brief": "When a company gives security over its property or assets, it registers the particulars of the charge with the Registrar of Companies.",
   "why": "The company created or changed a charge on its assets this year.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_charge",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within thirty days of the creation of the charge"
   },
   "dueText": "Within thirty days of its creation. On application the Registrar may allow registration within sixty days of creation on payment of additional fees, and within a further sixty days on payment of ad valorem fees.",
   "weight": 72,
   "source": "in_x_src_ca2013",
   "verified": true,
   "form": "CHG-1",
   "note": "The thirty days were read in the Act as passed in 2013 and the extended periods in the Companies (Amendment) Act, 2019. The form number CHG-1 was not read on an official page.",
   "roll": false
  },
  {
   "id": "in_x_board_meetings",
   "name": "Hold board meetings",
   "dept": "mca",
   "head": "Company meetings",
   "authority": "Ministry of Corporate Affairs",
   "brief": "The board of directors meets at least four times a year. A One Person Company, a small company and a dormant company need only one meeting in each half of the calendar year.",
   "why": "It is a company.",
   "applies": {
    "kind": [
     "corporation"
    ]
   },
   "frequency": "quarterly",
   "due": {
    "t": "event",
    "text": "At least four meetings a year, with not more than 120 days between two meetings"
   },
   "dueText": "First meeting within thirty days of incorporation; then at least four meetings every year with not more than one hundred and twenty days between two consecutive meetings. One Person, small and dormant companies: at least one meeting in each half of a calendar year, with a gap of not less than ninety days.",
   "weight": 70,
   "source": "in_x_src_ca2013",
   "verified": false,
   "form": "Board meetings under section 173",
   "note": "Read only in the Act as passed in 2013 (Gazette copy on nclt.gov.in). mca.gov.in and indiacode.nic.in refused access, so it could not be confirmed that this section has not been amended or relaxed by notification since.",
   "roll": false
  },
  {
   "id": "in_x_mgt14",
   "name": "File resolutions and agreements with the Registrar",
   "dept": "mca",
   "head": "Company filings",
   "authority": "Ministry of Corporate Affairs",
   "brief": "A copy of every special resolution, and of the other resolutions and agreements the Act lists, is filed with the Registrar of Companies.",
   "why": "The company passed a resolution or made an agreement that must be filed.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_resolution",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within thirty days of passing the resolution or making the agreement"
   },
   "dueText": "Within thirty days of the passing or making thereof.",
   "weight": 62,
   "source": "in_x_src_ca2013",
   "verified": false,
   "form": "MGT-14",
   "penalty": "As substituted in 2019: Rs 1,00,000 on the company plus Rs 500 a day (up to Rs 25,00,000), and Rs 50,000 on each officer in default plus Rs 500 a day (up to Rs 5,00,000).",
   "note": "The thirty days were read only in the Act as passed in 2013; later amendments, the exemptions for private companies and the form number MGT-14 were not read on an official page. The penalty is the 2019 text and may have been reduced since.",
   "roll": false
  },
  {
   "id": "in_x_dir12",
   "name": "Notify a change of directors or key managerial personnel",
   "dept": "mca",
   "head": "Company filings",
   "authority": "Ministry of Corporate Affairs",
   "brief": "A return of the particulars of directors and key managerial personnel is filed with the Registrar on every appointment and every change.",
   "why": "A director or key managerial person was appointed or changed this year.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_dir_change",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within thirty days of the appointment or change"
   },
   "dueText": "Within thirty days from the appointment of every director and key managerial personnel, and within thirty days of any change taking place.",
   "weight": 66,
   "source": "in_x_src_ca2013",
   "verified": false,
   "form": "DIR-12",
   "note": "Read only in the Act as passed in 2013; later amendments and the form number DIR-12 were not read on an official page.",
   "roll": false
  },
  {
   "id": "in_x_csr_unspent",
   "name": "Transfer unspent CSR money",
   "dept": "mca",
   "head": "Corporate social responsibility",
   "authority": "Ministry of Corporate Affairs",
   "brief": "A company covered by the corporate social responsibility rules that has not spent the required amount moves it: money for an ongoing project goes to a special bank account, and any other unspent money goes to a government fund listed in Schedule VII.",
   "why": "The company is above the CSR thresholds.",
   "applies": {
    "all": [
     {
      "kind": [
       "corporation"
      ]
     },
     {
      "q": "in_x_csr",
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
     ],
     [
      9,
      30
     ]
    ]
   },
   "dueText": "Ongoing projects: transfer to the Unspent Corporate Social Responsibility Account within thirty days from the end of the financial year. Other unspent amounts: transfer to a Schedule VII fund within six months of the expiry of the financial year.",
   "weight": 64,
   "source": "in_x_src_caa2019",
   "verified": false,
   "form": "Unspent Corporate Social Responsibility Account; Schedule VII fund",
   "penalty": "As passed in 2019: a fine of Rs 50,000 to Rs 25,00,000 on the company, with a fine or imprisonment for officers in default.",
   "note": "Read in the Companies (Amendment) Act, 2019 as passed. Whether and when this section was brought into force, later changes to the penalty, and the annual CSR report form (CSR-2) could not be read on an official page. The thresholds were read in the Act as passed in 2013.",
   "roll": false
  },
  {
   "id": "in_x_posh_report",
   "name": "Annual report on workplace sexual harassment complaints",
   "dept": "labour",
   "head": "Workplace",
   "authority": "District Officer (District Magistrate) under the Sexual Harassment of Women at Workplace Act",
   "brief": "Every workplace with ten or more workers has an Internal Committee. Each calendar year the committee reports the number of complaints received and disposed of to the employer and the District Officer, and the employer states the numbers in its own annual report.",
   "why": "You have ten or more employees.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "llc",
         "corporation",
         "nonprofit"
        ]
       },
       {
        "q": "in_business",
        "yes": true
       }
      ]
     },
     {
      "q": "in_employees",
      "yes": true
     },
     {
      "q": "in_headcount",
      "is": [
       "b",
       "c"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "fixed",
    "dates": [
     [
      1,
      31
     ]
    ]
   },
   "dueText": "A report for each calendar year. The New Delhi district office asks for the report for 1 January to 31 December to be filed latest by 31 January of the next year; other districts set their own date.",
   "weight": 72,
   "source": "in_x_src_posh",
   "verified": false,
   "form": "Annual report of the Internal Committee",
   "penalty": "Fine up to Rs 50,000 for an employer who fails to constitute the committee or to report; double on a repeat conviction.",
   "note": "The Act fixes the calendar year but not the date. 31 January was read on the New Delhi District Magistrate's notice (last updated 16 January 2024) and applies to that district; confirm the date with your own District Officer. The 31 January date was read on a district administration notice, not in the Act or its Rules: confirm it for your district.",
   "roll": false
  },
  {
   "id": "in_x_wages_time",
   "name": "Pay wages on time",
   "dept": "labour",
   "head": "Wages",
   "authority": "Ministry of Labour and Employment and State labour departments",
   "brief": "The Code on Wages, one of the four labour codes the Government has implemented, sets time limits for paying wages to every employee, whatever their salary.",
   "why": "You pay salaries.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "llc",
         "corporation",
         "nonprofit"
        ]
       },
       {
        "q": "in_business",
        "yes": true
       }
      ]
     },
     {
      "q": "in_employees",
      "yes": true
     }
    ]
   },
   "frequency": "monthly",
   "due": {
    "t": "afterPeriodEnd",
    "freq": "monthly",
    "basis": "cal",
    "months": 1,
    "day": 7
   },
   "dueText": "Monthly-rated employees: within 7 days of the next month. Daily wages at the end of the shift, weekly wages before the weekly holiday, fortnightly wages within 2 days of the end of the fortnight, and on termination or resignation within 2 working days.",
   "weight": 80,
   "source": "in_x_src_pib_msme",
   "verified": true,
   "form": "Wage payment under the Code on Wages, 2019",
   "note": "Read on the Press Information Bureau's official explainer of 5 December 2025, not in the Code or its rules (labour.gov.in refused access).",
   "roll": false
  },
  {
   "id": "in_x_labour_return",
   "name": "Single annual return under the labour codes",
   "dept": "labour",
   "head": "Labour returns",
   "authority": "Ministry of Labour and Employment and State labour departments",
   "brief": "The four labour codes replace the separate returns under 29 earlier labour laws with one electronic return. The form and date are set by the Central rules and by each State's rules.",
   "why": "You have employees.",
   "applies": {
    "all": [
     {
      "any": [
       {
        "kind": [
         "sole_prop",
         "partnership",
         "llc",
         "corporation",
         "nonprofit"
        ]
       },
       {
        "q": "in_business",
        "yes": true
       }
      ]
     },
     {
      "q": "in_employees",
      "yes": true
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "event",
    "text": "Set by the Central or State rules under the labour codes: confirm on the Shram Suvidha Portal or your State labour portal"
   },
   "dueText": "Not read on an official page. The government's explainer says only that there is a single return.",
   "weight": 68,
   "source": "in_x_src_pib_codes",
   "verified": false,
   "form": "Unified annual return (Shram Suvidha Portal or the State labour portal)",
   "note": "The four codes are reported to have taken effect on 21 November 2025 and Central rules to have been notified in May 2026 (both seen only in search results; pib.gov.in returned 403). labour.gov.in, shramsuvidha.gov.in and egazette.gov.in refused access, so the return's form, due date and penalty could not be read. Returns under the old Acts (maternity benefit, contract labour, factories, bonus, gratuity) should not be assumed to continue.",
   "roll": false
  },
  {
   "id": "in_x_mh_shops_return",
   "name": "Maharashtra shops and establishments annual return",
   "dept": "labour",
   "head": "Shops and establishments",
   "authority": "Labour Department, Government of Maharashtra",
   "brief": "Every employer of a shop or commercial establishment in Maharashtra uploads a yearly return for the calendar year.",
   "why": "You employ people in Maharashtra.",
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
           "llc",
           "corporation",
           "nonprofit"
          ]
         },
         {
          "q": "in_business",
          "yes": true
         }
        ]
       },
       {
        "q": "in_employees",
        "yes": true
       }
      ]
     },
     {
      "state": [
       "MH"
      ]
     }
    ]
   },
   "frequency": "annual",
   "due": {
    "t": "afterYearEnd",
    "basis": "cal",
    "months": 2
   },
   "dueText": "Within two months for the year ending on 31 December.",
   "weight": 66,
   "source": "in_x_src_mh_shops",
   "verified": true,
   "form": "Form R",
   "note": "The rules were read as notified on 23 March 2018; later amendments were not checked.",
   "roll": false
  },
  {
   "id": "in_x_mh_shops_change",
   "name": "Maharashtra: register the establishment and notify changes",
   "dept": "labour",
   "head": "Shops and establishments",
   "authority": "Labour Department, Government of Maharashtra",
   "brief": "An establishment with ten or more workers applies online for registration; one with fewer than ten sends an online intimation that it has started business. Any change to the registered details is notified online.",
   "why": "You employ people in Maharashtra.",
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
           "llc",
           "corporation",
           "nonprofit"
          ]
         },
         {
          "q": "in_business",
          "yes": true
         }
        ]
       },
       {
        "q": "in_employees",
        "yes": true
       }
      ]
     },
     {
      "state": [
       "MH"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Changes: within thirty days from the date the change took place"
   },
   "dueText": "Changes in the certificate of registration: within thirty days from the date the change took place. The certificate is to be renewed thirty days before its expiry.",
   "weight": 62,
   "source": "in_x_src_mh_shops",
   "verified": true,
   "form": "Form A (ten or more workers), Form F (fewer than ten), Form I (changes)",
   "note": "The time limit for the first registration or intimation is in the Act, which could not be read. The rules were read as notified on 23 March 2018; later amendments were not checked.",
   "roll": false
  },
  {
   "id": "in_x_dl_shops_reg",
   "name": "Delhi shops and establishments registration",
   "dept": "labour",
   "head": "Shops and establishments",
   "authority": "Chief Inspector of Shops and Establishments, Delhi",
   "brief": "The occupier of every shop or commercial establishment in Delhi sends a statement to the Chief Inspector to register it.",
   "why": "You run an establishment in Delhi.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit"
      ]
     },
     {
      "state": [
       "DL"
      ]
     }
    ]
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within ninety days of the date on which the establishment commences its work"
   },
   "dueText": "New establishments: within ninety days from the date on which the establishment commences the work.",
   "weight": 66,
   "source": "in_x_src_dl_shops",
   "verified": true,
   "form": "Form A (online, Delhi Labour Department)",
   "note": "Read in the Act as shown on the Delhi Labour Department's site, which gives no amendment date. The department's site says registration is now done online; companies newly incorporated in Delhi are reported to register through the incorporation form.",
   "roll": false
  },
  {
   "id": "in_x_dl_shops_change",
   "name": "Delhi: notify changes to, or closure of, the establishment",
   "dept": "labour",
   "head": "Shops and establishments",
   "authority": "Chief Inspector of Shops and Establishments, Delhi",
   "brief": "The occupier tells the Chief Inspector when any registered detail changes and when the establishment closes.",
   "why": "You run an establishment in Delhi.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit"
      ]
     },
     {
      "state": [
       "DL"
      ]
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Changes within thirty days; closure within fifteen days"
   },
   "dueText": "Changes: within thirty days after the change has taken place. Closure: within fifteen days of closing the establishment.",
   "weight": 55,
   "source": "in_x_src_dl_shops",
   "verified": true,
   "form": "Notice of change or closure",
   "roll": false
  },
  {
   "id": "in_x_fssai_return",
   "name": "FSSAI annual return",
   "dept": "licences",
   "head": "Food business",
   "authority": "Food Safety and Standards Authority of India",
   "brief": "Licensed food manufacturers (including repackers and relabellers), importers and manufacturer-exporters report the food handled in the previous financial year.",
   "why": "It manufactures or imports food under an FSSAI licence.",
   "applies": {
    "q": "in_x_food_mfr",
    "yes": true
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
   "dueText": "By 31 May every year, for the food business activities of the previous financial year.",
   "weight": 74,
   "source": "in_x_src_fssai_adv",
   "verified": true,
   "form": "Form D-1 (on the FoSCoS portal)",
   "penalty": "Rs 100 per day from 1 June, up to a maximum of 5 times the annual licence fee. No request to waive it is considered.",
   "roll": false
  },
  {
   "id": "in_x_fssai_renew",
   "name": "Renew the FSSAI licence or registration",
   "dept": "licences",
   "head": "Food business",
   "authority": "Food Safety and Standards Authority of India",
   "brief": "An FSSAI licence or registration is issued for one to five years and is renewed before it expires. The application can be made up to 180 days early.",
   "why": "It is a food business with an FSSAI licence or registration.",
   "applies": {
    "q": "in_x_food",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Not later than 30 days before the licence expires"
   },
   "dueText": "Not later than 30 days prior to the expiry of the licence, to avoid the late fee.",
   "weight": 72,
   "source": "in_x_src_fssai_faq",
   "verified": true,
   "form": "Renewal application on the FoSCoS portal",
   "penalty": "Late fee of Rs 100 per day in the last 30 days before expiry. After expiry: three times the annual fee from the 1st to the 90th day, and five times from the 91st to the 180th day.",
   "note": "Read on FSSAI's FAQ last updated 21 December 2022; a newer edition could not be opened.",
   "roll": false
  },
  {
   "id": "in_x_lm_reg",
   "name": "Register as a packer or importer of packaged goods",
   "dept": "licences",
   "head": "Packaged goods",
   "authority": "Director of Legal Metrology (Centre) or the State Controller of Legal Metrology",
   "brief": "Anyone who pre-packs any commodity for sale, or imports packaged commodities, registers their name and complete address with the legal metrology authority.",
   "why": "You pre-pack goods for sale or import packaged goods.",
   "applies": {
    "q": "in_x_prepack",
    "yes": true
   },
   "frequency": "once",
   "due": {
    "t": "event",
    "text": "Within ninety days from the date you start pre-packing or importing"
   },
   "dueText": "Within ninety days from the date on which pre-packing or importing commences.",
   "weight": 62,
   "source": "in_x_src_lm",
   "verified": true,
   "form": "Registration under rule 27, Legal Metrology (Packaged Commodities) Rules, 2011",
   "note": "Read in the Department's compilation of the rules 'with all amendments' dated May 2022; changes after that were not checked. The application fee stated there is Rs 500.",
   "roll": false
  },
  {
   "id": "in_x_tm_renew",
   "name": "Renew a registered trade mark",
   "dept": "licences",
   "head": "Intellectual property",
   "authority": "Trade Marks Registry",
   "brief": "A trade mark registration lasts ten years and can be renewed for ten years at a time.",
   "why": "You own a registered trade mark.",
   "applies": {
    "q": "in_x_trademark",
    "yes": true
   },
   "frequency": "event",
   "due": {
    "t": "anniversary",
    "of": "in_x_tm_expiry",
    "every": 10
   },
   "dueText": "Before the registration expires, every ten years. A late renewal is accepted with a surcharge within six months from the expiration of the last registration.",
   "weight": 60,
   "source": "in_x_src_tm",
   "verified": true,
   "form": "Form TM-R",
   "penalty": "A mark not renewed may be removed from the register. It can be restored after six months and within one year from the expiration of the last registration.",
   "note": "The form number TM-R comes from the Registry's forms list seen in search results, not from the Act.",
   "roll": false
  },
  {
   "id": "in_x_certin",
   "name": "Report a cyber security incident",
   "dept": "licences",
   "head": "Cyber security",
   "authority": "Indian Computer Emergency Response Team (CERT-In)",
   "brief": "Listed kinds of cyber incident, such as a data breach, ransomware or unauthorised access, are reported to CERT-In. Logs of all ICT systems are kept in India for a rolling 180 days.",
   "why": "It is a company, LLP or firm that runs computer systems.",
   "applies": {
    "kind": [
     "corporation",
     "llc",
     "partnership"
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Within 6 hours of noticing the incident or being told about it"
   },
   "dueText": "Within 6 hours of noticing such incidents or being brought to notice about such incidents.",
   "weight": 70,
   "source": "in_x_src_certin",
   "verified": true,
   "form": "Incident report to CERT-In (incident@cert-in.org.in)",
   "penalty": "Failure to furnish the information or to comply may invite punitive action under section 70B(7) of the Information Technology Act, 2000.",
   "note": "The directions took effect 60 days after 28 April 2022. CERT-In's site lists a later extension of the enforcement date for MSMEs (27 June 2022), which was not read.",
   "roll": false
  },
  {
   "id": "in_x_dpdp_breach",
   "name": "Personal data protection duties (phased in)",
   "dept": "licences",
   "head": "Data protection",
   "authority": "Data Protection Board of India; Ministry of Electronics and Information Technology",
   "brief": "Any business that decides why and how personal data is processed must give a clear consent notice, tell affected people about a data breach, publish a contact for data queries and answer access, correction and erasure requests.",
   "why": "You collect or use personal data in digital form.",
   "applies": {
    "all": [
     {
      "kind": [
       "sole_prop",
       "partnership",
       "llc",
       "corporation",
       "nonprofit"
      ]
     },
     {
      "q": "in_x_personal_data",
      "yes": true
     }
    ]
   },
   "frequency": "event",
   "due": {
    "t": "event",
    "text": "Breach: inform affected individuals without delay. Requests: answer within ninety days"
   },
   "dueText": "The Rules were notified on 14 November 2025 with an eighteen-month period for phased compliance. On a breach, inform all affected individuals without delay. Requests for access, correction, updating or erasure: within a maximum of ninety days.",
   "weight": 66,
   "source": "in_x_src_dpdp",
   "verified": false,
   "form": "Digital Personal Data Protection Act, 2023 and Rules, 2025",
   "penalty": "Up to Rs 250 crore for failing to keep reasonable security safeguards; up to Rs 200 crore for not notifying the Board or affected individuals of a breach; up to Rs 50 crore for other violations.",
   "note": "Read on the government's explainer, not in the Rules (meity.gov.in refused access). The exact date each duty starts, and the time limit for the detailed breach report to the Board, could not be read and must be confirmed.",
   "roll": false
  }
 ],
 "sources": [
  {
   "id": "in_x_src_fla",
   "title": "Foreign Liabilities and Assets (FLA) Return: frequently asked questions",
   "url": "https://www.rbi.org.in/commonman/english/scripts/FAQs.aspx?Id=1171",
   "publisher": "Reserve Bank of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_fema395",
   "title": "Foreign Exchange Management (Mode of Payment and Reporting of Non-Debt Instruments) Regulations, 2019 (FEMA 395/2019-RB)",
   "url": "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11723&Mode=0",
   "publisher": "Reserve Bank of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_ecb",
   "title": "Master Direction - External Commercial Borrowings, Trade Credits and Structured Obligations",
   "url": "https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=11510",
   "publisher": "Reserve Bank of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_fema400",
   "title": "Foreign Exchange Management (Overseas Investment) Regulations, 2022 (FEMA 400/2022-RB)",
   "url": "https://www.rbi.org.in/scripts/NotificationUser.aspx?Id=12380&Mode=0",
   "publisher": "Reserve Bank of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_fema23",
   "title": "Foreign Exchange Management (Export and Import of Goods and Services) Regulations, 2026 (FEMA 23(R)/2026-RB)",
   "url": "https://www.rbi.org.in/Scripts/BS_FemaNotifications.aspx?Id=13277",
   "publisher": "Reserve Bank of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_ftp2",
   "title": "Foreign Trade Policy 2023, Chapter 2: General Provisions Regarding Imports and Exports",
   "url": "https://content.dgft.gov.in/Website/dgftprod/4f665d2f-20cc-4887-ae6a-5ec912bc0d44/FTP2023_Chapter02.pdf",
   "publisher": "Directorate General of Foreign Trade",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_caa2019",
   "title": "The Companies (Amendment) Act, 2019 (No. 22 of 2019), Gazette of India, 31 July 2019",
   "url": "https://cdnbbsr.s3waas.gov.in/s3e2ad76f2326fbc6b56a45a56c59fafdb/uploads/2018/05/2023010354.pdf",
   "publisher": "Government of India (Gazette of India)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_ca2013",
   "title": "The Companies Act, 2013 (No. 18 of 2013), as published in the Gazette of India on 30 August 2013",
   "url": "https://nclt.gov.in/sites/default/files/Act&rules/the_companies_act_2013_0.pdf",
   "publisher": "National Company Law Tribunal",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_posh",
   "title": "The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013",
   "url": "https://law.delhi.gov.in/sites/default/files/inline-files/posh_act_2013.pdf",
   "publisher": "Department of Law, Justice and Legislative Affairs, Government of NCT of Delhi",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_pib_msme",
   "title": "New Labour Codes Modernizing India's MSME Ecosystem (5 December 2025)",
   "url": "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/dec/doc2025125719501.pdf",
   "publisher": "Press Information Bureau",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_pib_codes",
   "title": "India's Labour Reforms: Simplification, Security, and Sustainable Growth (21 November 2025)",
   "url": "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251121701501.pdf",
   "publisher": "Press Information Bureau",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_mh_shops",
   "title": "Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Rules, 2018",
   "url": "https://mahakamgar.maharashtra.gov.in/Site/Upload/PDF/Regulation_of_Employment_Conditions_of_Service_Rules_2018.pdf",
   "publisher": "Labour Department, Government of Maharashtra",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_dl_shops",
   "title": "The Delhi Shops and Establishments Act, 1954",
   "url": "https://labour.delhi.gov.in/labour/delhi-shops-act-1954-0",
   "publisher": "Labour Department, Government of NCT of Delhi",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_fssai_adv",
   "title": "Advisory: Annual Return Submission by the Food Businesses (16 April 2024)",
   "url": "https://fssai.gov.in/upload/advisories/2024/04/661e73c35373eRevised%20annual%20return.pdf",
   "publisher": "Food Safety and Standards Authority of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_fssai_faq",
   "title": "Frequently Asked Questions on FSSAI Licence and Registration",
   "url": "https://fssai.gov.in/upload/uploadfiles/files/FAQs_Licensing_Registration_21_12_2022.pdf",
   "publisher": "Food Safety and Standards Authority of India",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_lm",
   "title": "The Legal Metrology (Packaged Commodities) Rules, 2011, with all amendments",
   "url": "https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Book_on_Legal_Metrology_Packaged_Commodities_Rules,2011_with_all_amendments_whatsnews.pdf",
   "publisher": "Department of Consumer Affairs",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_tm",
   "title": "The Trade Marks Act, 1999",
   "url": "https://ipindia.gov.in/tm-act-1999",
   "publisher": "Office of the Controller General of Patents, Designs and Trade Marks",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_certin",
   "title": "Directions under sub-section (6) of section 70B of the Information Technology Act, 2000 (28 April 2022)",
   "url": "https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf",
   "publisher": "Indian Computer Emergency Response Team (CERT-In)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_x_src_dpdp",
   "title": "DPDP Rules, 2025 Notified: A Citizen-Centric Framework for Privacy Protection and Responsible Data Use (17 November 2025)",
   "url": "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf",
   "publisher": "Press Information Bureau",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cgst50",
   "title": "Central Goods and Services Tax Act, 2017, section 50: Interest on delayed payment of tax (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/539253",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cgst122",
   "title": "Central Goods and Services Tax Act, 2017, section 122: Penalty for certain offences (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/539375",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cgst129",
   "title": "Central Goods and Services Tax Act, 2017, section 129: Detention, seizure and release of goods and conveyances in transit (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/539398",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_gstn21_2021",
   "title": "Notification No. 21/2021-Central Tax: late fee for FORM GSTR-4",
   "url": "https://gstcouncil.gov.in/sites/default/files/2024-05/notfctn-21-central-tax-english-2021.pdf",
   "publisher": "GST Council",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cir246",
   "title": "Circular No. 246/03/2025-GST: late fee for delay in furnishing FORM GSTR-9C",
   "url": "https://cbic-gst.gov.in/pdf/cir-cgst-246-03-2025.pdf",
   "publisher": "Central Board of Indirect Taxes and Customs",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cgstrules",
   "title": "Central Goods and Services Tax Rules, 2017 (rules 48, 61A, 62, 96A, 138E)",
   "url": "https://gstcouncil.gov.in/sites/default/files/2024-04/01062021-cgst-rules-2017-part-a-rules.pdf",
   "publisher": "GST Council",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_itd_itrfaq",
   "title": "Income Tax Act 2025 FAQs: Income Tax Returns",
   "url": "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns",
   "publisher": "Income Tax Department",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_bma43",
   "title": "Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015, section 43 (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/527015",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_itd_10bd",
   "title": "Form 10BD-BE FAQs",
   "url": "https://www.incometax.gov.in/iec/foportal/help/all-topics/statutory-forms/popular-form/form10bd-10be-faq",
   "publisher": "Income Tax Department",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_tr_26qbdem",
   "title": "TRACES FAQs: Form 26QB demand payment",
   "url": "https://contents.tdscpc.gov.in/en/faq-taxpayer-26qb-demand.html",
   "publisher": "Income Tax Department (TRACES, Centralized Processing Cell for TDS)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_tr_lp",
   "title": "TRACES FAQs: Default - Late payment",
   "url": "https://contents.tdscpc.gov.in/en/faq-dedu-default-lp.html",
   "publisher": "Income Tax Department (TRACES, Centralized Processing Cell for TDS)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_tr_26qd",
   "title": "TRACES FAQs of Form 26QD",
   "url": "https://contents.tdscpc.gov.in/en/faq-taxpayer-26QD-general.html",
   "publisher": "Income Tax Department (TRACES, Centralized Processing Cell for TDS)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_itd_tds",
   "title": "Income Tax Act 2025 FAQs: TDS Compliance",
   "url": "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/tds-compliance",
   "publisher": "Income Tax Department",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_tr_tan",
   "title": "TRACES FAQs: General - TAN",
   "url": "https://traces61contents.tdscpc.gov.in/en/faq-general-tan.html",
   "publisher": "Income Tax Department (TRACES, Centralized Processing Cell for TDS)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_itr7post",
   "title": "FAQs on ITR-7: post processing queries",
   "url": "https://www.incometax.gov.in/iec/foportal/sites/default/files/2023-11/FAQ-%20ITR%207_Post%20processing%20queries.pdf",
   "publisher": "Income Tax Department",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_css128",
   "title": "Code on Social Security, 2020, section 128: Power to recover damages (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/539733",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_esireg",
   "title": "Employees' State Insurance (General) Regulations, 1950, regulations 31, 31-A and 31-C (India Code)",
   "url": "https://indiacode.gov.in/server/api/core/bitstreams/b43ee1e9-64bd-46b0-84bd-98326422315b/content",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_cow54",
   "title": "Code on Wages, 2019, section 54: Penalties for offences (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/539270",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_mhsea29",
   "title": "Maharashtra Shops and Establishments (Regulation of Employment and Conditions of Service) Act, 2017, section 29 (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/574343",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_dlshops",
   "title": "Delhi Shops and Establishments Act, 1954 (with commentary)",
   "url": "https://labour.delhi.gov.in/labour/delhi-shops-act-1954-0",
   "publisher": "Labour Department, Government of NCT of Delhi",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_lmpc",
   "title": "Legal Metrology (Packaged Commodities) Rules, 2011 with all amendments (rule 32)",
   "url": "https://consumeraffairs.gov.in/public/upload/admin/cmsfiles/whatsnews/Book_on_Legal_Metrology_Packaged_Commodities_Rules,2011_with_all_amendments_whatsnews.pdf",
   "publisher": "Department of Consumer Affairs",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_dpdp",
   "title": "DPDP Rules, 2025 Notified (PIB backgrounder)",
   "url": "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf",
   "publisher": "Press Information Bureau",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca96",
   "title": "Companies Act, 2013, section 96: Annual general meeting (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/514826",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca99",
   "title": "Companies Act, 2013, section 99: Punishment for default in complying with sections 96 to 98 (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/514860",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca137",
   "title": "Companies Act, 2013, section 137: Copy of financial statement to be filed with Registrar (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/515136",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca92",
   "title": "Companies Act, 2013, section 92: Annual return (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/514782",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca139",
   "title": "Companies Act, 2013, section 139: Appointment of auditors (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/515139",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca147",
   "title": "Companies Act, 2013, section 147: Punishment for contravention (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537709",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca117",
   "title": "Companies Act, 2013, section 117: Resolutions and agreements to be filed (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/515059",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca170",
   "title": "Companies Act, 2013, section 170: Register of directors and key managerial personnel (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/515173",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca172",
   "title": "Companies Act, 2013, section 172: Penalty (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537731",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca173",
   "title": "Companies Act, 2013, section 173: Meetings of Board (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537732",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca450",
   "title": "Companies Act, 2013, section 450: Punishment where no specific penalty or punishment is provided (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537978",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca86",
   "title": "Companies Act, 2013, section 86: Punishment for contravention (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/514715",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca135",
   "title": "Companies Act, 2013, section 135: Corporate Social Responsibility (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/515134",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_ca405",
   "title": "Companies Act, 2013, section 405: Power of Central Government to direct companies to furnish information or statistics (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537933",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_msme_order",
   "title": "Specified Companies (Furnishing of information about payment to micro and small enterprise suppliers) Order, 2019 (S.O. 368(E), 22 January 2019), Gazette copy on India Code",
   "url": "https://indiacode.gov.in/server/api/core/bitstreams/e3552d97-8223-4835-8456-fc64f3e5b5b0/content",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_pib_kyc",
   "title": "MCA replaces Annual KYC requirements under the Companies Act, 2013 with abridged KYC requirements once in three years (1 January 2026)",
   "url": "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2210552",
   "publisher": "Press Information Bureau (Ministry of Corporate Affairs)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_llp35",
   "title": "Limited Liability Partnership Act, 2008, section 35: Annual return (India Code)",
   "url": "https://indiacode.gov.in/handle/123456789/537639",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  },
  {
   "id": "in_y_llprules",
   "title": "Limited Liability Partnership Rules, 2009 (Gazette text on India Code), rules 24 and 25",
   "url": "https://indiacode.gov.in/server/api/core/bitstreams/2d22d59c-4f09-4529-9566-e261c9341d6a/content",
   "publisher": "Legislative Department, Ministry of Law and Justice (India Code)",
   "checked": "2026-11-11"
  }
 ],
 "patches": {
  "in_itr2": {
   "penalty": "Late filing fee: Rs 1,000 if total income does not exceed Rs 5 lakh, Rs 5,000 in any other case (section 234F of the 1961 Act for AY 2026-27 and earlier; section 428 of the Income Tax Act, 2025, same amounts, from Tax Year 2026-27). Interest on unpaid tax is separate.",
   "penaltySource": "in_y_itd_itrfaq"
  },
  "in_sched_fa": {
   "penalty": "Under the Black Money Act, 2015, section 43: a resident (other than not ordinarily resident) who files a return but does not disclose, or gives inaccurate particulars of, a foreign asset (including a financial interest in an entity) or foreign-source income may be directed to pay a penalty of Rs 10 lakh. It does not apply to assets other than immovable property whose aggregate value does not exceed Rs 20 lakh.",
   "penaltySource": "in_y_bma43"
  },
  "in_np_audit": {
   "penalty": "If Form 10B/10BB is not filed by the due date (or is filed late), the exemption claimed in the return is not allowed when the return is processed and a demand is raised. A delay can be condoned on application: up to 365 days by the jurisdictional CIT(Exemption), beyond 365 days and up to 3 years by the Pr. CCIT/CCIT(Exemption).",
   "penaltySource": "in_y_itr7post"
  },
  "in_10bd": {
   "penalty": "Fee of Rs 200 for each day of delay (section 234G), and a penalty for failure to file of not less than Rs 10,000 and up to Rs 1,00,000 (section 271K).",
   "penaltySource": "in_y_itd_10bd",
   "note": "Sections are of the 1961 Act; the mention of the Income-tax Act, 2025 equivalent was not found on an official page read."
  },
  "in_form10": {
   "penalty": "If Form 10 is not filed by its due date (or is filed late), the accumulation of income claimed is not allowed when the return is processed and a demand is raised. A delay can be condoned on application: up to 365 days by the CIT(Exemption), beyond 365 days and up to 3 years by the Pr. CCIT/CCIT(Exemption).",
   "penaltySource": "in_y_itr7post",
   "note": "This November 2023 FAQ describes the Form 10 due date as the section 139(1) return due date, while the ITD's current 'Return / Forms applicable' page (and our rule) says at least two months before that date; the consequence is the same. 1961 Act position."
  },
  "in_form9a": {
   "penalty": "If Form 9A is not filed by its due date (or is filed late), the deemed application of income claimed is not allowed when the return is processed and a demand is raised. Delay can be condoned on application (up to 365 days: CIT(Exemption); beyond 365 days up to 3 years: Pr. CCIT/CCIT(Exemption)).",
   "penaltySource": "in_y_itr7post",
   "note": "1961 Act position (November 2023 FAQ)."
  },
  "in_26qb": {
   "penalty": "Late filing fee of Rs 200 for each day the 26QB is late, not exceeding the TDS deductible (section 234E); interest of 1.5% a month from deduction to deposit on tax paid late, and 1% a month on tax deducted late (section 201(1A)). CPC-TDS raises these as a demand, which cannot be waived.",
   "penaltySource": "in_y_tr_26qbdem",
   "note": "The ITD says interest rates for late deduction/deposit are unchanged under the Income Tax Act, 2025 (section 398(3)(a)); the 2025 Act section for the late filing fee was not read."
  },
  "in_26qc": {
   "penalty": "Interest of 1.5% a month (or part of a month) from the date of deduction to the date of deposit on TDS paid late, and 1% a month on tax deducted late. A late filing fee of Rs 200 a day, not exceeding the tax deducted, applies to TDS statements filed after the due date (section 234E).",
   "penaltySource": "in_y_tr_lp",
   "note": "The fee wording is from the TRACES late-filing FAQ (in_y_tr_lf), which states it for 'the TDS/TCS statement' in general and not for Form 26QC by name; TRACES' 26QB demand FAQ states it for 26QB and lists 26QC demand payment alongside. Interest rates confirmed unchanged under the 2025 Act on in_y_itd_taxpay."
  },
  "in_26qd": {
   "penalty": "Interest of 1.5% a month (or part of a month) from the date of deduction to the date of deposit on TDS paid late, and 1% a month on tax deducted late. A late filing fee of Rs 200 a day, not exceeding the tax deducted, applies to TDS statements filed after the due date (section 234E).",
   "penaltySource": "in_y_tr_lp",
   "verified": true,
   "source": "in_y_tr_26qd",
   "note": "Confirms the deposit-and-file part only; the fifteen-day period for the certificate (Form 16D) was not read on an official page. For a non-resident payee the FAQ says the due date is seven days from the end of the month and Form 27Q is used instead. Fee wording as for 26QC (general TRACES statement, not naming 26QD)."
  },
  "in_tan": {
   "penalty": "Failure to apply for TAN, or not quoting it in the specified documents, attracts a penalty of Rs 10,000. Without a TAN the deductor cannot file TDS/TCS statements or deposit TDS/TCS challans in banks.",
   "penaltySource": "in_y_tr_tan",
   "note": "The TRACES FAQ (last reviewed 31 March 2026) refers to section 203A of the 1961 Act; the 2025 Act penalty section was not read."
  },
  "in_form16": {
   "penalty": "For FY 2025-26 certificates, a penalty of Rs 500 for each day of default under section 272A(2)(g) of the 1961 Act can be levied for failure to issue TDS certificates within the due date.",
   "penaltySource": "in_y_itd_tds",
   "note": "The ITD FAQ answers this for Form 16A and speaks of 'certificates' generally; it does not name Form 16. The equivalent under the Income Tax Act, 2025 (Form 130) was not read."
  },
  "in_form16a": {
   "penalty": "For FY 2025-26 certificates, a penalty of Rs 500 for each day of default under section 272A(2)(g) of the 1961 Act can be levied for failure to issue Form 16A within the due date.",
   "penaltySource": "in_y_itd_tds",
   "note": "The Income Tax Act, 2025 equivalent (Form 131) was not read."
  },
  "in_gst_register": {
   "penalty": "A person liable to be registered who fails to obtain registration is liable to a penalty of Rs 10,000 or an amount equal to the tax evaded, whichever is higher (CGST Act section 122(1)(xi)).",
   "penaltySource": "in_y_cgst122",
   "note": "The figure is under the Central GST Act; the State GST Acts were not read."
  },
  "in_pmt06": {
   "penalty": "Interest on tax paid late: 18% a year (CGST Act section 50(1), rate set by Notification 13/2017-Central Tax), from the day after the tax was due until it is paid.",
   "penaltySource": "in_y_cgst50",
   "note": "Section 50 applies to every person who fails to pay tax within the prescribed period; rule 61A(3) (CGST Rules) sets the PMT-06 deposit by the 25th of the following month. The 18% rate is read in Notification 13/2017-Central Tax (source in_y_gstn13_2017)."
  },
  "in_cmp08": {
   "penalty": "Interest of 18% a year on tax paid late (CGST Act section 50(1); Notification 13/2017-Central Tax). If CMP-08 is not furnished for two consecutive quarters, no e-way bill (Part A of EWB-01) can be generated for the person's outward movements (CGST Rules, rule 138E(a)).",
   "penaltySource": "in_y_cgstrules",
   "note": "Interest wording and rate: CGST Act section 50(1) (in_y_cgst50) and Notification 13/2017-Central Tax (in_y_gstn13_2017). No late fee for CMP-08 was read on an official page."
  },
  "in_gstr4": {
   "penalty": "Late fee under CGST Act section 47(1): Rs 100 a day, up to Rs 5,000. From FY 2021-22 the CGST late fee for GSTR-4 is waived above Rs 250 where the central tax payable is nil, and above Rs 1,000 in other cases (Notification 21/2021-Central Tax). Interest of 18% a year on tax paid late (section 50).",
   "penaltySource": "in_y_gstn21_2021",
   "note": "Figures are central tax (CGST) only; the State GST late fee was not read. Section 47(1) text: in_y_cgst47."
  },
  "in_gstr9c": {
   "penalty": "GSTR-9C is part of the annual return, so the annual-return late fee runs until GSTR-9C is filed (Circular 246/03/2025-GST). Late fee under CGST Act section 47(2): Rs 100 a day, up to 0.25% of turnover in the State or Union territory; for FY 2022-23 onwards, where aggregate turnover is over Rs 5 crore and up to Rs 20 crore, the CGST late fee is waived above Rs 50 a day, capped at 0.02% of turnover in the State (Notification 07/2023-Central Tax).",
   "penaltySource": "in_y_cir246",
   "note": "Section 47(2) text in in_y_cgst47; the Rs 50 a day / 0.02% band in in_y_gstn7_2023 (row 2: turnover above Rs 5 crore up to Rs 20 crore). Over Rs 20 crore no waiver row applies, so the section 47(2) figures stand. CGST only; State GST not read."
  },
  "in_einvoice": {
   "penalty": "An invoice that a person required to use e-invoicing issues without obtaining the Invoice Reference Number in the prescribed manner is not treated as an invoice (CGST Rules, rule 48(5)).",
   "penaltySource": "in_y_cgstrules"
  },
  "in_eway": {
   "penalty": "Goods moved in contravention of the Act or Rules (which includes moving them without the required e-way bill) and the vehicle can be detained or seized. They are released on payment of a penalty of 200% of the tax payable (exempt goods: 2% of value or Rs 25,000, whichever is less) where the owner comes forward; otherwise 50% of the value or 200% of the tax, whichever is higher (exempt goods: 5% of value or Rs 25,000, whichever is less) (CGST Act section 129).",
   "penaltySource": "in_y_cgst129"
  },
  "in_lut": {
   "penalty": "There is no separate fee for not furnishing the LUT; without a bond or LUT the export cannot be made without payment of integrated tax. Under the LUT the exporter is bound to pay the tax with 18% interest (section 50(1)) if goods are not exported within three months of the invoice (or export services are not paid for in foreign exchange within one year); if that is not paid, the LUT facility is withdrawn until the amount is paid (rule 96A(1), (3), (4)).",
   "penaltySource": "in_y_cgstrules",
   "verified": true,
   "source": "in_y_cgstrules",
   "note": "Rule 96A requires the LUT 'prior to export'. That one LUT covers a whole financial year (our 'due' text) was not read on an official page in this check."
  },
  "in_pf": {
   "penalty": "For contributions not paid on time, the Central Provident Fund Commissioner (or an authorised officer) may levy damages of up to the amount of the arrears, after giving the employer a hearing, in the manner set by the Provident Fund scheme (Code on Social Security, 2020, section 128). The employer also owes simple interest, at a rate notified by the Central Government, from the date the amount fell due until payment (section 127).",
   "penaltySource": "in_y_css128",
   "note": "The PIB reply (in_y_pib_codes) says the four Labour Codes, including the Code on Social Security, 2020, came into effect on 21 November 2025. The damages rates in the EPF scheme and the notified interest rate were not read (epfindia.gov.in redirects to epfo.gov.in, which refused access, 403)."
  },
  "in_esi": {
   "penalty": "Simple interest of 12% a year for each day of delay (ESI (General) Regulations, regulation 31-A), and damages of up to 5% a year of the amount due for a delay under 2 months, 10% for 2 to under 4 months, 15% for 4 to under 6 months and 25% for 6 months and more (regulation 31-C). The Code on Social Security, 2020 caps damages at the amount of arrears (section 128).",
   "penaltySource": "in_y_esireg",
   "verified": true,
   "source": "in_y_esireg",
   "note": "These regulations were made under the ESI Act, 1948. The PIB reply (in_y_pib_codes) says the four Labour Codes, including the Code on Social Security, 2020, came into effect on 21 November 2025. Whether the regulations continue unchanged under the Code was not checked (esic.gov.in did not respond). Section 128 of the Code: in_y_css128."
  },
  "in_agm": {
   "penalty": "If the meeting is not held as section 96 requires, the company and every officer in default are punishable with a fine of up to Rs 1,00,000, and for a continuing default a further fine of up to Rs 5,000 for every day the default continues (Companies Act, 2013, section 99).",
   "penaltySource": "in_y_ca99",
   "verified": true,
   "source": "in_y_ca96",
   "note": "Section 96(1) applies to every company other than a One Person Company; the Registrar may extend the time for any AGM other than the first by up to three months, and not more than fifteen months may pass between two AGMs. India Code lists a Jan Vishwas (Amendment of Provisions) Act, 2026; whether it changed this penalty was not checked."
  },
  "in_aoc4": {
   "verified": true,
   "source": "in_y_ca137",
   "note": "Penalty read in section 137(3): company Rs 10,000 plus Rs 100 a day of continuing failure, up to Rs 2,00,000; managing director and CFO (or the responsible directors) Rs 10,000 plus Rs 100 a day, up to Rs 50,000. Section 403 (in_y_ca403): late filing under section 92 or 137 carries an additional fee of not less than Rs 100 a day (actual amount prescribed by rules not read: MCA refused access). Where no AGM is held, file within 30 days of the last date it should have been held (section 137(2))."
  },
  "in_aoc4_opc": {
   "verified": true,
   "source": "in_y_ca137",
   "note": "Same section 137(3) penalty and section 403 additional fee as AOC-4."
  },
  "in_mgt7": {
   "verified": true,
   "source": "in_y_ca92",
   "note": "Penalty read in section 92(5): company and every officer in default Rs 10,000 plus Rs 100 a day of continuing failure, up to Rs 2,00,000 (company) and Rs 50,000 (officer). Additional fee of not less than Rs 100 a day under section 403 (in_y_ca403)."
  },
  "in_mgt7a": {
   "verified": true,
   "source": "in_y_ca92",
   "note": "Section 92(1) lets the Government prescribe an abridged annual return for One Person Companies and small companies; the form name MGT-7A comes from the rules, which were not read (MCA refused access). Section 96(1) excludes One Person Companies from holding an AGM. Same section 92(5) penalty as MGT-7."
  },
  "in_adt1": {
   "penalty": "Contravening sections 139 to 146 (which include filing the notice of the auditor's appointment): the company is punishable with a fine of Rs 25,000 to Rs 5,00,000 and every officer in default with a fine of Rs 10,000 to Rs 1,00,000 (section 147(1)). A late filing can also be made on payment of an additional fee (section 403), the amount of which is set by rules not read.",
   "penaltySource": "in_y_ca147",
   "verified": true,
   "source": "in_y_ca139",
   "note": "The form name ADT-1 is from the Companies (Audit and Auditors) Rules, not re-read in this check. India Code lists a Jan Vishwas (Amendment of Provisions) Act, 2026; whether it changed this penalty was not checked."
  },
  "in_dir3": {
   "dueText": "From 31 March 2026 the yearly KYC is replaced by a KYC intimation once in every three years (rule 12A, Companies (Appointment and Qualification of Directors) Rules, 2014, as amended by G.S.R. 943(E) of 31 December 2025). Directors who have already completed their KYC must next file by 30 June 2028.",
   "due": {
    "t": "event",
    "text": "Once every three years; directors whose KYC is complete next file by 30 June 2028"
   },
   "source": "in_y_pib_kyc",
   "note": "The PIB release does not state the exact recurring date for later cycles or for new DIN holders; the amended rule itself is on mca.gov.in, which refused access. Directors who had not filed KYC could have their DINs re-activated under the old provisions until 31 March 2026."
  },
  "in_msme1": {
   "penalty": "MSME Form I is required by an order under section 405 of the Companies Act. A company that fails to comply, or furnishes information incorrect or incomplete in any material respect, and every officer in default are liable to a penalty of Rs 20,000, plus Rs 1,000 a day of continuing failure, up to Rs 3,00,000 (section 405(4)).",
   "penaltySource": "in_y_ca405",
   "verified": true,
   "source": "in_y_msme_order",
   "note": "Applies to 'specified companies': those whose payments to micro and small enterprise suppliers exceed 45 days from acceptance or deemed acceptance. The 2019 Order itself says it is made under section 405 and refers to section 405(4). Any later amendment of the Order was not checked."
  },
  "in_llp11": {
   "verified": true,
   "source": "in_y_llp35",
   "note": "Penalty read in section 35(2): Rs 100 a day of failure, up to Rs 1,00,000 for the LLP and Rs 50,000 for designated partners; plus an additional fee for late filing under section 69 (amount set by rules, not read). Form 11 is named in rule 25 of the LLP Rules, 2009 (in_y_llprules)."
  },
  "in_llp8": {
   "verified": true,
   "source": "in_y_llprules",
   "note": "Penalty read in LLP Act section 34(5) (in_y_llp34): Rs 100 a day of failure, up to Rs 1,00,000 for the LLP and Rs 50,000 for every designated partner; plus additional fee under section 69. The LLP Rules copy read is the 2009 Gazette text on India Code; later amendments were not checked."
  },
  "in_x_chg1": {
   "penalty": "A company in default under the charges chapter is liable to a penalty of Rs 5,00,000 and every officer in default to Rs 50,000 (section 86(1)). Registration after thirty days needs the Registrar's permission and additional fees (within sixty days) or ad valorem fees (within a further sixty days) (section 77(1)). An unregistered charge is not taken into account by the liquidator or any other creditor (section 77(3)).",
   "penaltySource": "in_y_ca86"
  },
  "in_x_board_meetings": {
   "penalty": "No penalty specific to failing to hold Board meetings was found in section 173; the Act's general penalty then applies: Rs 10,000, plus Rs 1,000 a day of continuing contravention, up to Rs 2,00,000 for the company and Rs 50,000 for an officer in default (section 450). An officer whose duty is to give notice of a Board meeting and fails to do so is liable to a penalty of Rs 25,000 (section 173(4)).",
   "penaltySource": "in_y_ca450",
   "verified": true,
   "source": "in_y_ca173",
   "note": "Section 173(5): One Person, small and dormant companies comply if at least one meeting is held in each half of a calendar year with a gap of not less than ninety days; it does not apply to a One Person Company with only one director. Section 450 is the general penalty for contraventions with no penalty provided elsewhere; it is applied here by its own terms, not by an official statement naming section 173."
  },
  "in_x_mgt14": {
   "verified": true,
   "source": "in_y_ca117",
   "note": "Penalty read in section 117(2): company Rs 10,000 plus Rs 100 a day, up to Rs 2,00,000; every officer in default (including any liquidator) Rs 10,000 plus Rs 100 a day, up to Rs 50,000."
  },
  "in_x_dir12": {
   "penalty": "Section 170 has no penalty of its own, so the penalty for its Chapter (XI, Appointment and Qualifications of Directors) applies: the company and every officer in default are liable to a penalty of Rs 50,000, plus Rs 500 a day of continuing failure, up to Rs 3,00,000 for the company and Rs 1,00,000 for an officer (section 172).",
   "penaltySource": "in_y_ca172",
   "verified": true,
   "source": "in_y_ca170",
   "note": "That section 170 sits in Chapter XI (sections 149 to 172) was read in the Act's text on nclt.gov.in (in_y_nclt_ca), which is the as-enacted 2013 text; the penalty wording is the current text on India Code. The form name DIR-12 is from the rules (not read)."
  },
  "in_x_csr_unspent": {
   "verified": true,
   "source": "in_y_ca135",
   "note": "Section 135(5): other unspent amounts go to a Schedule VII fund 'within a period of six months of the expiry of the financial year'. Unspent Account money not spent within three financial years goes to a Schedule VII fund within thirty days of the end of the third year. Penalty in section 135(7): twice the amount required to be transferred or Rs 1 crore, whichever is less, for the company; one-tenth of that amount or Rs 2,00,000, whichever is less, for each officer in default."
  },
  "in_x_posh_report": {
   "note": "The Act (section 21(1)) confirms an annual report 'in each calendar year', submitted to the employer and the District Officer, 'at such time as may be prescribed' (source in_y_posh). The New Delhi District Magistrate's notice setting 31 January could not be opened this time (dmnewdelhi.delhi.gov.in reset the connection twice), so the 31 January date is not confirmed here."
  },
  "in_x_wages_time": {
   "penalty": "Paying wages late contravenes section 17 of the Code on Wages: on conviction, a fine of up to Rs 20,000 (up to one month's imprisonment or a fine of up to Rs 40,000, or both, for a repeat within five years). Paying less than is due: fine up to Rs 50,000 (repeat: up to three months' imprisonment or fine up to Rs 1,00,000, or both). Before prosecuting under the general clause, the Inspector-cum-Facilitator must first give a written direction with time to comply, unless the same violation is repeated within five years.",
   "penaltySource": "in_y_cow54"
  },
  "in_x_mh_shops_return": {
   "penalty": "Contravening the Act or the rules made under it (which include the Form R return): fine up to Rs 1,00,000, plus up to Rs 2,000 for each day a contravention continues, but the total fine may not exceed Rs 2,000 per worker employed; on a later conviction for the same provision, fine up to Rs 2,00,000 (same per-worker cap) (section 29).",
   "penaltySource": "in_y_mhsea29"
  },
  "in_x_mh_shops_change": {
   "penalty": "Contravening the Act or the rules made under it: fine up to Rs 1,00,000, plus up to Rs 2,000 for each day a contravention continues, but the total fine may not exceed Rs 2,000 per worker employed; on a later conviction for the same provision, fine up to Rs 2,00,000 (section 29).",
   "penaltySource": "in_y_mhsea29"
  },
  "in_x_dl_shops_reg": {
   "penalty": "Contravening any provision of the Act or its rules or orders (other than sections 33, 41 and 42): on conviction, the proprietor, employer or manager is punished with a fine of not less than Rs 25 and up to Rs 250 (section 40(1)).",
   "penaltySource": "in_y_dlshops"
  },
  "in_x_dl_shops_change": {
   "penalty": "Contravening any provision of the Act or its rules or orders (other than sections 33, 41 and 42): on conviction, a fine of not less than Rs 25 and up to Rs 250 (section 40(1)).",
   "penaltySource": "in_y_dlshops",
   "note": "Figures as printed on the Delhi Labour Department's page; later amendments not checked."
  },
  "in_x_lm_reg": {
   "penalty": "Contravening any provision of the Packaged Commodities Rules for which no punishment is otherwise provided (which covers the rule 27 registration): fine of Rs 5,000 (rule 32, as substituted from 1 January 2018).",
   "penaltySource": "in_y_lmpc"
  },
  "in_x_dpdp_breach": {
   "verified": true,
   "source": "in_y_dpdp",
   "note": "Same document: failure to notify the Data Protection Board or affected individuals of a breach can attract a penalty of up to Rs 200 crore; failure to keep reasonable security safeguards up to Rs 250 crore; other violations up to Rs 50 crore. The Board must also be notified of a breach; its timing was not stated in this document."
  }
 }
};
