import { Product, ProductCategory } from '@/types';

export const SEED_CATEGORIES: ProductCategory[] = [
  {
    "id": "cat-1",
    "name": "Neuropeptides",
    "slug": "neuropeptides",
    "description": "Synthesized neuropeptide sequences for cognitive, neurochemical, and neurological research models.",
    "is_active": true
  },
  {
    "id": "cat-2",
    "name": "Cellular & Tissue Research",
    "slug": "cellular-research",
    "description": "High-purity peptide analogues for cellular repair, extracellular matrix, and angiogenesis assays.",
    "is_active": true
  },
  {
    "id": "cat-3",
    "name": "Longevity & Epigenetics",
    "slug": "longevity-research",
    "description": "Research compounds evaluated in cellular senescence, telomerase activity, and chromatin assays.",
    "is_active": true
  },
  {
    "id": "cat-4",
    "name": "Metabolic Peptides",
    "slug": "metabolic-peptides",
    "description": "Mitochondrial-derived peptides, incretin mimetics, and metabolic signaling research sequences.",
    "is_active": true
  },
  {
    "id": "cat-5",
    "name": "Reconstitution & Solvents",
    "slug": "reconstitution-solvents",
    "description": "USP-grade sterile bacteriostatic water and reconstitution solutions for laboratory solvent formulation.",
    "is_active": true
  },
  {
    "id": "cat-6",
    "name": "Growth Hormone Secretagogues",
    "slug": "growth-hormone-secretagogues",
    "description": "GHRH analogues, GHRPs, and selective growth hormone secretagogue peptides for endocrine research.",
    "is_active": true
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    "id": "prod-bpc-157",
    "name": "BPC-157",
    "slug": "bpc-157-5mg",
    "short_description": "BPC‑157 5 mg – Stable Gastric Pentadecapeptide Research Peptide",
    "description": "Product overview\n\nBPC‑157 (Body Protection Compound‑157) is a synthetic pentadecapeptide composed of 15 amino acids, derived from a partial sequence of a protective protein found in human gastric juice.[web:120][web:128] It is studied in preclinical models for its cytoprotective, pro‑angiogenic, and tissue‑repair–related signalling effects in a range of organ systems.[web:113][web:114][web:138]\n\nThe BPC‑157 5 mg vial provides a defined amount of lyophilized peptide suitable for in‑vitro assays and in‑vivo animal studies where lower quantities or dose titration are required. This material is intended strictly for laboratory research and is not approved for human or veterinary use.[web:120][web:131]\n\nQuick product snapshot\n\nField",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-BPC-005",
    "cas_number": "137525-51-0",
    "sequence": "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    "molecular_formula": "C62H98N16O22",
    "molecular_weight": 1419.53,
    "purity": "99.6% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 62,
    "compare_at_price": 72,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-prod-bpc-157-cover",
        "product_id": "prod-bpc-157",
        "image_url": "/images/uploads/bpc_157_1793446882817.jpg",
        "alt_text": "BPC-157 Primary Cover",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-prod-bpc-157-packaging",
        "product_id": "prod-bpc-157",
        "image_url": "/images/labelbox/bpc157.jpg",
        "alt_text": "BPC-157 Sterile Packaging Box",
        "sort_order": 1,
        "is_primary": false
      },
      {
        "id": "img-prod-bpc-157-vial",
        "product_id": "prod-bpc-157",
        "image_url": "/images/products/bpc-157.jpg",
        "alt_text": "BPC-157 Laboratory Vial View",
        "sort_order": 2,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-bpc-157-5mg-coa",
        "product_id": "prod-bpc-157",
        "title": "Certificate of Analysis (Batch #PB-BPC-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-BPC-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-bpc-157-5mg-sds",
        "product_id": "prod-bpc-157",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-BPC-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-bpc-157-5mg-1",
        "product_id": "prod-bpc-157",
        "title": "Analytical chromatography and mass spectrometric characterization of BPC-157",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-bpc157-tb500-blend",
    "name": "BPC-157 (5mg) + TB-500 (5mg) Blend",
    "slug": "bpc-157-tb-500-blend-10mg",
    "short_description": "BPC‑157 (5 mg) + TB‑500 (5 mg) Blend – Dual Tissue-Repair Research Peptide",
    "description": "Product overview\n\nThe BPC‑157 + TB‑500 Blend combines two extensively studied synthetic peptides in a fixed 1:1 ratio, delivering 5 mg BPC‑157 and 5 mg TB‑500 per 10 mg lyophilized vial.[web:111][web:118] BPC‑157 is a stable 15‑amino‑acid fragment of a gastric protective protein, while TB‑500 is a synthetic heptapeptide corresponding to the N‑acetylated actin‑binding region of thymosin beta‑4.[web:111][web:115][web:118]\n\nThis pre‑formulated blend is used in preclinical research to explore complementary and potentially synergistic effects on tissue protection, soft‑tissue repair, angiogenesis, cell migration, and inflammatory pathway modulation.[web:113][web:116][web:119] The vial is supplied as a sterile, white to off‑white lyophilized powder with high purity verified by HPLC and identity confirmed by mass spectrometry.\n\nThis material is intended strictly for in‑vitro experiments and in‑vivo animal models in qualified laboratories and is not approved for human or veterinary use.\n\nQuick product snapshot",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-BLD-010",
    "cas_number": "137525-51-0 / 77591-33-4",
    "sequence": "BPC-157 (15-AA) + Thymosin Beta-4 Domain (43-AA)",
    "molecular_formula": "C62H98N16O22 / C212H350N56O78S",
    "molecular_weight": "1419.6, 889",
    "purity": "99.4% (HPLC)",
    "size": "10 mg Total (5mg + 5mg)",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 118,
    "compare_at_price": 135,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-prod-bpc157-tb500-blend-cover",
        "product_id": "prod-bpc157-tb500-blend",
        "image_url": "/images/uploads/bpc_157__5mg____tb_500__5mg__b_1793445909470.jpg",
        "alt_text": "BPC-157 (5mg) + TB-500 (5mg) Blend Primary Cover",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-prod-bpc157-tb500-blend-packaging",
        "product_id": "prod-bpc157-tb500-blend",
        "image_url": "/images/labelbox/bpc-157plustb-500.jpg",
        "alt_text": "BPC-157 (5mg) + TB-500 (5mg) Blend Sterile Packaging Box",
        "sort_order": 1,
        "is_primary": false
      },
      {
        "id": "img-prod-bpc157-tb500-blend-vial",
        "product_id": "prod-bpc157-tb500-blend",
        "image_url": "/images/products/bpc-157plustb-500.jpg",
        "alt_text": "BPC-157 (5mg) + TB-500 (5mg) Blend Laboratory Vial View",
        "sort_order": 2,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-bpc-157-tb-500-blend-10mg-coa",
        "product_id": "prod-bpc157-tb500-blend",
        "title": "Certificate of Analysis (Batch #PB-BLD-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-BLD-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-bpc-157-tb-500-blend-10mg-sds",
        "product_id": "prod-bpc157-tb500-blend",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-BLD-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-bpc-157-tb-500-blend-10mg-1",
        "product_id": "prod-bpc157-tb500-blend",
        "title": "Analytical chromatography and mass spectrometric characterization of BPC-157 (5mg) + TB-500 (5mg) Blend",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-bacteriostatic-water",
    "name": "Bacteriostatic Water for Injection (0.9% Benzyl Alcohol)",
    "slug": "bacteriostatic-water-10ml",
    "short_description": "Bacteriostatic Water (10 mL, 0.9% Benzyl Alcohol) – Research‑Grade Reconstitution Solvent",
    "description": "Product overview\n\nBacteriostatic water is sterile, non‑pyrogenic water containing 0.9% benzyl alcohol as a preservative, supplied here in a 10 mL multi‑dose vial for laboratory use.[web:37][web:39] The benzyl alcohol component inhibits the growth of most contaminating bacteria, allowing the solution to remain usable for repeated withdrawals under proper aseptic technique for a defined in‑use period.[web:37][web:44]\n\nIn research environments, bacteriostatic water is widely used as a reconstitution and dilution medium for lyophilized peptides, proteins, and other experimental compounds, especially when multi‑dose access and contamination control are required.[web:37][web:48] This description is written specifically for a research‑only e‑commerce catalog and is not intended as medical or dosing guidance.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-5",
    "category": "Reconstitution & Solvents",
    "product_code": "PB-BAC-010",
    "cas_number": "7732-18-5 / 100-51-6",
    "sequence": "Sterile Filtered Aqueous Reconstitution Solvent",
    "molecular_formula": "H2O + C7H8O",
    "molecular_weight": 18.02,
    "purity": "USP Grade / 0.9% Benzyl Alcohol",
    "size": "10 mL",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 14,
    "compare_at_price": 18,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-prod-bacteriostatic-water-cover",
        "product_id": "prod-bacteriostatic-water",
        "image_url": "/images/uploads/bacteriostatic_water_for_injec_1793447257771.jpg",
        "alt_text": "Bacteriostatic Water for Injection (0.9% Benzyl Alcohol) Primary Cover",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-prod-bacteriostatic-water-packaging",
        "product_id": "prod-bacteriostatic-water",
        "image_url": "/images/labelbox/bacteriostaticwater.jpg",
        "alt_text": "Bacteriostatic Water for Injection (0.9% Benzyl Alcohol) Sterile Packaging Box",
        "sort_order": 1,
        "is_primary": false
      },
      {
        "id": "img-prod-bacteriostatic-water-vial",
        "product_id": "prod-bacteriostatic-water",
        "image_url": "/images/products/bacteriostatic-water.jpg",
        "alt_text": "Bacteriostatic Water for Injection (0.9% Benzyl Alcohol) Laboratory Vial View",
        "sort_order": 2,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-bacteriostatic-water-10ml-coa",
        "product_id": "prod-bacteriostatic-water",
        "title": "Certificate of Analysis (Batch #PB-BAC-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-BAC-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-bacteriostatic-water-10ml-sds",
        "product_id": "prod-bacteriostatic-water",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-BAC-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-bacteriostatic-water-10ml-1",
        "product_id": "prod-bacteriostatic-water",
        "title": "Analytical chromatography and mass spectrometric characterization of Bacteriostatic Water for Injection (0.9% Benzyl Alcohol)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-cjc-ipa-blend",
    "name": "CJC-1295 (No DAC) + Ipamorelin Blend (10mg)",
    "slug": "cjc-1295-ipamorelin-blend-10mg",
    "short_description": "CJC‑1295 No DAC (5 mg) + Ipamorelin (5 mg) Blend – Growth Hormone Axis Research Peptide",
    "description": "Product overview\n\nThe CJC‑1295 No DAC + Ipamorelin Blend combines two growth hormone secretagogues in a fixed 1:1 ratio, delivering 5 mg CJC‑1295 (No DAC, Mod GRF 1‑29) and 5 mg Ipamorelin per 10 mg lyophilized vial.[web:143][web:154][web:157] CJC‑1295 (No DAC) is a 29‑amino‑acid analogue of growth hormone‑releasing hormone (GHRH 1‑29) with four stabilizing substitutions, while Ipamorelin is a synthetic pentapeptide ghrelin mimetic with the sequence Aib‑His‑D‑2‑Nal‑D‑Phe‑Lys‑NH₂.[web:143][web:144][web:150][web:155]\n\nIn preclinical systems, this dual‑peptide formulation is used to investigate synergistic growth hormone release via combined GHRH receptor activation and ghrelin receptor (GHS‑R1a) stimulation, as well as downstream IGF‑1 and metabolic signalling.[web:145][web:148][web:154] The blend is supplied as a sterile, white to off‑white lyophilized powder with high purity confirmed by HPLC and identity validated by mass spectrometry.[web:145][web:155]\n\nThis material is intended strictly for in‑vitro experiments and in‑vivo animal models in qualified laboratories. It is not approved for human or veterinary use.\n\nQuick product snapshot",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-BLD-IPA",
    "cas_number": "863288-34-0 / 170851-70-4",
    "sequence": "Mod GRF 1-29 + Aib-His-D-2Nal-D-Phe-Lys-NH2",
    "molecular_formula": "C152H252N44O42 / C38H49N9O5",
    "molecular_weight": "3367.9, 711.9",
    "purity": "99.3% (HPLC)",
    "size": "10 mg Total (5mg + 5mg)",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 125,
    "compare_at_price": 145,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-prod-cjc-ipa-blend-cover",
        "product_id": "prod-cjc-ipa-blend",
        "image_url": "/images/uploads/cjc_1295__no_dac____ipamorelin_1793447439651.jpg",
        "alt_text": "CJC-1295 (No DAC) + Ipamorelin Blend (10mg) Primary Cover",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-prod-cjc-ipa-blend-packaging",
        "product_id": "prod-cjc-ipa-blend",
        "image_url": "/images/labelbox/cjc.jpg",
        "alt_text": "CJC-1295 (No DAC) + Ipamorelin Blend (10mg) Sterile Packaging Box",
        "sort_order": 1,
        "is_primary": false
      },
      {
        "id": "img-prod-cjc-ipa-blend-vial",
        "product_id": "prod-cjc-ipa-blend",
        "image_url": "/images/products/cjc.jpg",
        "alt_text": "CJC-1295 (No DAC) + Ipamorelin Blend (10mg) Laboratory Vial View",
        "sort_order": 2,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-cjc-1295-ipamorelin-blend-10mg-coa",
        "product_id": "prod-cjc-ipa-blend",
        "title": "Certificate of Analysis (Batch #PB-BLD-IPA-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-BLD-IPA-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-cjc-1295-ipamorelin-blend-10mg-sds",
        "product_id": "prod-cjc-ipa-blend",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-BLD-IPA-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-cjc-1295-ipamorelin-blend-10mg-1",
        "product_id": "prod-cjc-ipa-blend",
        "title": "Analytical chromatography and mass spectrometric characterization of CJC-1295 (No DAC) + Ipamorelin Blend (10mg)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-cjc-1295-dac",
    "name": "CJC-1295 DAC",
    "slug": "cjc-1295-dac-2mg",
    "short_description": "# CJC-1295 with DAC — GHRH Analog (Extended Half-Life)",
    "description": "**Research Grade | 99%+ Purity | Korean Manufactured | GMP Standards | Lyophilized Powder**\n\n> ⚠️ **For In Vitro Laboratory Research Only.** Not for human or animal consumption. Not approved for therapeutic, diagnostic, or clinical use.\n\n---\n\n## What Is CJC-1295 with DAC?\n\nCJC-1295 with DAC is a synthetic growth hormone releasing hormone (GHRH) analogue built from the first 29 amino acids of natural GHRH, with several amino acid substitutions for enhanced stability and receptor affinity, plus a chemical attachment called the Drug Affinity Complex (DAC) that fundamentally changes how long the peptide stays active in circulation.",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-CJC-DAC",
    "cas_number": "863288-34-0",
    "sequence": "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-Lys(Maleimidopropionyl)-NH2",
    "molecular_formula": "C165H271N47O46",
    "molecular_weight": 3647.28,
    "purity": "99.1% (HPLC)",
    "size": "2 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 58,
    "compare_at_price": 68,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-cjc-1295-dac-2mg-box",
        "product_id": "prod-cjc-1295-dac",
        "image_url": "/images/labelbox/cjc-1295.jpg",
        "alt_text": "CJC-1295 DAC Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-cjc-1295-dac-2mg-vial",
        "product_id": "prod-cjc-1295-dac",
        "image_url": "/images/products/cjc-1295-dac.jpg",
        "alt_text": "CJC-1295 DAC 2 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-cjc-1295-dac-2mg-coa",
        "product_id": "prod-cjc-1295-dac",
        "title": "Certificate of Analysis (Batch #PB-CJC-DAC-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-CJC-DAC-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-cjc-1295-dac-2mg-sds",
        "product_id": "prod-cjc-1295-dac",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-CJC-DAC-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-cjc-1295-dac-2mg-1",
        "product_id": "prod-cjc-1295-dac",
        "title": "Analytical chromatography and mass spectrometric characterization of CJC-1295 DAC",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-cjc-1295-no-dac",
    "name": "CJC-1295 (No DAC / Mod GRF 1-29)",
    "slug": "cjc-1295-no-dac-2mg",
    "short_description": "# CJC-1295 (No DAC) – Mod GRF 1-29 (Research Grade)",
    "description": "## Product overview\n\nCJC-1295 (No DAC), also known as Modified GRF 1‑29 or Mod GRF (1‑29), is a 29‑amino acid peptide analog based on the biologically active N‑terminal region of growth hormone‑releasing hormone (GHRH).[web:143][web:317][web:324] It incorporates four strategic amino acid substitutions that improve metabolic stability, increase receptor affinity, and protect the peptide from rapid degradation by enzymes such as DPP‑IV in research models.[web:143][web:322][web:324]\n\nThis product is supplied as a high‑purity lyophilised powder for in‑vitro experiments and approved preclinical animal studies only. It is not a drug, supplement, or cosmetic and is not approved for any form of human or veterinary administration.[web:317][web:321][web:323]\n\n---\n\n## Quick product snapshot",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-CJC-NODAC",
    "cas_number": "863288-34-0",
    "sequence": "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2",
    "molecular_formula": "C152H252N44O42",
    "molecular_weight": 3367.97,
    "purity": "99.5% (HPLC)",
    "size": "2 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 48,
    "compare_at_price": 56,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-cjc-1295-no-dac-2mg-box",
        "product_id": "prod-cjc-1295-no-dac",
        "image_url": "/images/labelbox/cjc-1295-no-dac.jpg",
        "alt_text": "CJC-1295 (No DAC / Mod GRF 1-29) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-cjc-1295-no-dac-2mg-vial",
        "product_id": "prod-cjc-1295-no-dac",
        "image_url": "/images/products/cjc-1295-no-dac.jpg",
        "alt_text": "CJC-1295 (No DAC / Mod GRF 1-29) 2 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-cjc-1295-no-dac-2mg-coa",
        "product_id": "prod-cjc-1295-no-dac",
        "title": "Certificate of Analysis (Batch #PB-CJC-NODAC-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-CJC-NODAC-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-cjc-1295-no-dac-2mg-sds",
        "product_id": "prod-cjc-1295-no-dac",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-CJC-NODAC-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-cjc-1295-no-dac-2mg-1",
        "product_id": "prod-cjc-1295-no-dac",
        "title": "Analytical chromatography and mass spectrometric characterization of CJC-1295 (No DAC / Mod GRF 1-29)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-aod-9604-5mg",
    "name": "AOD-9604 (5mg)",
    "slug": "aod-9604-5mg",
    "short_description": "AOD-9604 5 mg – Modified C-Terminal Lipolytic Fragment (177-191)",
    "description": "Product overview\n\nAOD-9604 is a synthetic peptide analog of the lipolytic C-terminal region of human growth hormone (Tyr-hGH 177-191) with an added N-terminal tyrosine residue to facilitate stability. In preclinical studies, it is investigated for stimulating lipolytic lipid metabolism, activating beta-3 adrenergic pathways, and inhibiting lipogenesis in adipocyte cell cultures without altering circulating IGF-1 or blood glucose levels.\n\nSupplied as a sterile, white lyophilized powder with certified analytical purity verified by HPLC and exact mass confirmed by mass spectrometry.\n\nThis material is intended strictly for in-vitro experiments and approved laboratory research. It is not approved for human or veterinary use.\n\nQuick product snapshot",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-AOD-005",
    "cas_number": "221231-10-3",
    "sequence": "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe",
    "molecular_formula": "C78H123N23O23S2",
    "molecular_weight": 1815.1,
    "purity": "99.3% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 58,
    "compare_at_price": 68,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-prod-aod-9604-5mg-cover",
        "product_id": "prod-aod-9604-5mg",
        "image_url": "/images/uploads/aod_9604__5mg__1793433832161.jpg",
        "alt_text": "AOD-9604 (5mg) Primary Cover",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-prod-aod-9604-5mg-packaging",
        "product_id": "prod-aod-9604-5mg",
        "image_url": "/images/labelbox/aod9604.jpg",
        "alt_text": "AOD-9604 (5mg) Sterile Packaging Box",
        "sort_order": 1,
        "is_primary": false
      },
      {
        "id": "img-prod-aod-9604-5mg-vial",
        "product_id": "prod-aod-9604-5mg",
        "image_url": "/images/products/aod-9604.jpg",
        "alt_text": "AOD-9604 (5mg) Laboratory Vial View",
        "sort_order": 2,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-aod-9604-5mg-coa",
        "product_id": "prod-aod-9604-5mg",
        "title": "Certificate of Analysis (Batch #PB-AOD-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-AOD-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-aod-9604-5mg-sds",
        "product_id": "prod-aod-9604-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-AOD-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-aod-9604-5mg-1",
        "product_id": "prod-aod-9604-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of AOD-9604",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-epithalon-10mg",
    "name": "Epithalon (Epitalon)",
    "slug": "epithalon-10mg",
    "short_description": "Epithalon (Epitalon) 10 mg – Synthetic Tetrapeptide Research Peptide",
    "description": "Product overview\n\nEpithalon (also spelled Epitalon) is a synthetic tetrapeptide with the amino acid sequence Ala‑Glu‑Asp‑Gly, developed as a research analog of a pineal gland extract known as epithalamin.[web:54][web:60] The peptide is investigated primarily for its ability to modulate telomerase activity, influence telomere length, and affect cellular aging pathways in controlled experimental systems.[web:54][web:63]\n\nThis 10 mg format provides a standardized lyophilized preparation intended exclusively for in‑vitro and preclinical research. It is not approved for therapeutic use and is not supplied for human or veterinary administration.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-3",
    "category": "Longevity & Epigenetics",
    "product_code": "PB-EPI-010",
    "cas_number": "307297-39-8",
    "sequence": "Ala-Glu-Asp-Gly",
    "molecular_formula": "C14H22N4O9",
    "molecular_weight": 390.35,
    "purity": "99.7% (HPLC)",
    "size": "10 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 65,
    "compare_at_price": 75,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-epithalon-10mg-box",
        "product_id": "prod-epithalon-10mg",
        "image_url": "/images/labelbox/epithalon.jpg",
        "alt_text": "Epithalon (Epitalon) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-epithalon-10mg-vial",
        "product_id": "prod-epithalon-10mg",
        "image_url": "/images/products/epithalon.jpg",
        "alt_text": "Epithalon (Epitalon) 10 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-epithalon-10mg-coa",
        "product_id": "prod-epithalon-10mg",
        "title": "Certificate of Analysis (Batch #PB-EPI-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-EPI-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-epithalon-10mg-sds",
        "product_id": "prod-epithalon-10mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-EPI-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-epithalon-10mg-1",
        "product_id": "prod-epithalon-10mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Epithalon (Epitalon)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-ghk-cu-50mg",
    "name": "GHK-Cu (Copper Tripeptide Chelate)",
    "slug": "ghk-cu-50mg",
    "short_description": "# GHK-Cu Copper Peptide (50mg) — Product Page",
    "description": "---\n\n## Product Title\n**GHK-Cu Copper Peptide (50mg) | 99%+ Purity | Korean Manufactured | Research Use Only**\n\n---\n\n## Short Intro\n\nGHK-Cu is a tripeptide-copper complex that occurs naturally in human blood, saliva, and urine. Made up of just three amino acids — Glycine, Histidine, and Lysine — it binds tightly to copper ions to form a stable complex that plays a meaningful role in how the body manages tissue repair, inflammation, and cellular maintenance. Plasma levels of GHK-Cu are highest in youth and drop steadily with age, which has made it a subject of growing interest in aging and regenerative research.",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-GHK-050",
    "cas_number": "49557-75-7",
    "sequence": "(Gly-His-Lys)2·Cu",
    "molecular_formula": "C14H24CuN6O4",
    "molecular_weight": 403.92,
    "purity": "99.5% (HPLC)",
    "size": "50 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 58,
    "compare_at_price": 68,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-ghk-cu-50mg-box",
        "product_id": "prod-ghk-cu-50mg",
        "image_url": "/images/labelbox/ghk-cu.jpg",
        "alt_text": "GHK-Cu (Copper Tripeptide Chelate) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-ghk-cu-50mg-vial",
        "product_id": "prod-ghk-cu-50mg",
        "image_url": "/images/products/ghk-cu.jpg",
        "alt_text": "GHK-Cu (Copper Tripeptide Chelate) 50 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-ghk-cu-50mg-coa",
        "product_id": "prod-ghk-cu-50mg",
        "title": "Certificate of Analysis (Batch #PB-GHK-050-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-GHK-050-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-ghk-cu-50mg-sds",
        "product_id": "prod-ghk-cu-50mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-GHK-050-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-ghk-cu-50mg-1",
        "product_id": "prod-ghk-cu-50mg",
        "title": "Analytical chromatography and mass spectrometric characterization of GHK-Cu (Copper Tripeptide Chelate)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-ghrp-6-5mg",
    "name": "GHRP-6 (Growth Hormone Releasing Peptide-6)",
    "slug": "ghrp-6-5mg",
    "short_description": "# GHRP-6 – Growth Hormone Releasing Peptide (Research Grade)",
    "description": "## Product overview\n\nGHRP-6 is a synthetic hexapeptide used in laboratory research to study growth hormone secretagogue biology and ghrelin receptor signalling.[web:272][web:277][web:278] It acts as a GHSR-1a agonist and is commonly used in in-vitro systems and approved preclinical models to examine hormone release, appetite-related signalling, and tissue-protection pathways.[web:275][web:278][web:281]\n\nThis product is supplied strictly for research use only. It is not intended for human or veterinary use, dietary supplementation, or any therapeutic, cosmetic, or diagnostic purpose.[web:274][web:276][web:279]\n\n---\n\n## Quick product snapshot",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-GHRP6-005",
    "cas_number": "87616-84-0",
    "sequence": "His-D-Trp-Ala-Trp-D-Phe-Lys-NH2",
    "molecular_formula": "C46H56N12O6",
    "molecular_weight": 872.44,
    "purity": "99.2% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 46,
    "compare_at_price": 54,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-ghrp-6-5mg-box",
        "product_id": "prod-ghrp-6-5mg",
        "image_url": "/images/labelbox/ghrp-6.jpg",
        "alt_text": "GHRP-6 (Growth Hormone Releasing Peptide-6) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-ghrp-6-5mg-vial",
        "product_id": "prod-ghrp-6-5mg",
        "image_url": "/images/products/ghrp-6.jpg",
        "alt_text": "GHRP-6 (Growth Hormone Releasing Peptide-6) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-ghrp-6-5mg-coa",
        "product_id": "prod-ghrp-6-5mg",
        "title": "Certificate of Analysis (Batch #PB-GHRP6-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-GHRP6-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-ghrp-6-5mg-sds",
        "product_id": "prod-ghrp-6-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-GHRP6-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-ghrp-6-5mg-1",
        "product_id": "prod-ghrp-6-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of GHRP-6 (Growth Hormone Releasing Peptide-6)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-glutathione-600mg",
    "name": "L-Glutathione (Reduced / GSH)",
    "slug": "l-glutathione-600mg",
    "short_description": "L‑Glutathione 600 mg (10 mL) – Reduced γ‑Glu‑Cys‑Gly Antioxidant Tripeptide (Research Grade)",
    "description": "Product overview\n\nL‑Glutathione 600 mg is a pure, lyophilised preparation of reduced glutathione (GSH), the naturally occurring tripeptide γ‑L‑glutamyl‑L‑cysteinyl‑glycine.[web:253][web:256][web:259] GSH is the predominant low‑molecular‑weight thiol in mammalian cells and functions as a central intracellular antioxidant and redox buffer in a wide range of biological systems.[web:253][web:256][web:265]\n\nThis 600 mg vial size is designed for redox biology, detoxification, and oxidative‑stress research in in‑vitro assays, cell culture work, and small‑animal models, where multiple experiments can be supported from a single vial. The product is supplied strictly for laboratory research use and is not intended for human or veterinary consumption, therapeutic use, or cosmetic application.[web:257][web:258][web:267]\n\nQuick product snapshot\n\nField",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-GSH-600",
    "cas_number": "70-18-8",
    "sequence": "gamma-L-Glutamyl-L-cysteinylglycine",
    "molecular_formula": "C10H17N3O6S",
    "molecular_weight": 307.3,
    "purity": "99.8% (HPLC)",
    "size": "600 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 42,
    "compare_at_price": 50,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-l-glutathione-600mg-box",
        "product_id": "prod-glutathione-600mg",
        "image_url": "/images/labelbox/l-gluatione.jpg",
        "alt_text": "L-Glutathione (Reduced / GSH) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-l-glutathione-600mg-vial",
        "product_id": "prod-glutathione-600mg",
        "image_url": "/images/products/l-glutathione.jpg",
        "alt_text": "L-Glutathione (Reduced / GSH) 600 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-l-glutathione-600mg-coa",
        "product_id": "prod-glutathione-600mg",
        "title": "Certificate of Analysis (Batch #PB-GSH-600-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-GSH-600-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-l-glutathione-600mg-sds",
        "product_id": "prod-glutathione-600mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-GSH-600-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-l-glutathione-600mg-1",
        "product_id": "prod-glutathione-600mg",
        "title": "Analytical chromatography and mass spectrometric characterization of L-Glutathione (Reduced / GSH)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-hgh-frag-2mg",
    "name": "HGH Fragment 176-191 (AOD-9604)",
    "slug": "hgh-fragment-176-191-2mg",
    "short_description": "# Fragment 176-191 (10mg)",
    "description": "Fragment 176-191 is a synthetic peptide representing the C-terminal portion of human growth hormone (hGH), often called the \"lipolytic fragment.\" It is studied for its potential to influence fat metabolism while avoiding some of the broader effects of full hGH.\n\n**Don't forget your BAC Water**  \nReconstitution Solution (30ml) (BAC Water)\n\n## What is Fragment 176-191?\nFragment 176-191 is a small piece of hGH that has been heavily researched in animal models, particularly for its fat-burning properties. Lab studies in mice have shown it can enhance fat breakdown without raising insulin-like growth factor-1 (IGF-1) levels or affecting carbohydrate metabolism and insulin sensitivity like full hGH does [web:65][web:66]. This targeted profile makes it useful for exploring fat metabolism and could inform future anti-obesity research.\n\n## Peptide Information\n| Property | Value |\n|----------|-------|\n| Sequence | Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe |\n| Molecular Formula | C78H125N23O23S2 |\n| Molecular Weight | 1817.12 g/mol |\n| CAS Number | 66004-57-7 |\n\n## Research Highlights\nResearch has explored Fragment 176-191 in several areas:",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-FRG-002",
    "cas_number": "221231-10-3",
    "sequence": "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe",
    "molecular_formula": "C78H125N23O23S2",
    "molecular_weight": 1815.1,
    "purity": "99.1% (HPLC)",
    "size": "2 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 49,
    "compare_at_price": 58,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-hgh-fragment-176-191-2mg-box",
        "product_id": "prod-hgh-frag-2mg",
        "image_url": "/images/labelbox/high-fragment-176-191.jpg",
        "alt_text": "HGH Fragment 176-191 (AOD-9604) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-hgh-fragment-176-191-2mg-vial",
        "product_id": "prod-hgh-frag-2mg",
        "image_url": "/images/products/hgh-fragment.jpg",
        "alt_text": "HGH Fragment 176-191 (AOD-9604) 2 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-hgh-fragment-176-191-2mg-coa",
        "product_id": "prod-hgh-frag-2mg",
        "title": "Certificate of Analysis (Batch #PB-FRG-002-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-FRG-002-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-hgh-fragment-176-191-2mg-sds",
        "product_id": "prod-hgh-frag-2mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-FRG-002-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-hgh-fragment-176-191-2mg-1",
        "product_id": "prod-hgh-frag-2mg",
        "title": "Analytical chromatography and mass spectrometric characterization of HGH Fragment 176-191 (AOD-9604)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-hgh-191aa-10iu",
    "name": "HGH 191 (10 IU)",
    "slug": "hgh-191-10iu",
    "short_description": "HGH 191 (10 IU) – Recombinant Human Growth Hormone (191-AA)",
    "description": "Product overview\n\nHuman Growth Hormone (HGH 191) is a 191-amino acid single-chain recombinant polypeptide matching the exact structure and sequence of natural pituitary human growth hormone. As a master metabolic and somatotropic regulator, recombinant HGH binds with high affinity to extracellular growth hormone receptors (GHR), activating intracellular JAK2/STAT5 signaling cascades and stimulating downstream hepatic synthesis and secretion of insulin-like growth factor 1 (IGF-1).\n\nIn preclinical biomedical research, recombinant HGH 191 is utilized to explore somatotrophic signaling, lipid mobilization, chondrocyte proliferation, skeletal muscle protein turnover, and cellular aging mechanisms. Supplied as a sterile, white lyophilized solid powder with certified analytical purity (≥99%) verified by SEC-HPLC and exact molecular identity confirmed by mass spectrometry.\n\nThis material is intended strictly for in-vitro experiments and approved laboratory research. It is not approved for human or veterinary use.\n\nQuick product snapshot",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-HGH-010",
    "cas_number": "12629-01-5",
    "sequence": "191 Amino Acid Recombinant Polypeptide Sequence",
    "molecular_formula": "C990H1528N262O300S7",
    "molecular_weight": 22124,
    "purity": "99.0% (SEC-HPLC)",
    "size": "10 IU",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 95,
    "compare_at_price": 110,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-hgh-191aa-10iu-box",
        "product_id": "prod-hgh-191aa-10iu",
        "image_url": "/images/labelbox/hgh-191.jpg",
        "alt_text": "HGH 191 Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-hgh-191aa-10iu-vial",
        "product_id": "prod-hgh-191aa-10iu",
        "image_url": "/images/products/hgh-191.jpg",
        "alt_text": "HGH 191 (10 IU) Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-hgh-191aa-10iu-coa",
        "product_id": "prod-hgh-191aa-10iu",
        "title": "Certificate of Analysis (Batch #PB-HGH-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-HGH-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-hgh-191aa-10iu-sds",
        "product_id": "prod-hgh-191aa-10iu",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-HGH-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-hgh-191aa-10iu-1",
        "product_id": "prod-hgh-191aa-10iu",
        "title": "Analytical chromatography and mass spectrometric characterization of HGH 191 (Recombinant Human Growth Hormone)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-igf1-lr3-1mg",
    "name": "IGF-1 LR3 (Long R3 IGF-1)",
    "slug": "igf-1-lr3-1mg",
    "short_description": "IGF‑1 LR3 1 mg – Long Arg3 Insulin‑Like Growth Factor‑1 (Research Grade Analogue)",
    "description": "Product overview\n\nIGF‑1 LR3 (Long Arg3 Insulin‑Like Growth Factor‑1) is a recombinant analogue of human insulin‑like growth factor‑1 engineered for increased metabolic stability and extended receptor engagement in controlled research models.[web:236][web:237][web:240] The LR3 variant incorporates a 13‑amino‑acid N‑terminal extension and a glutamic‑acid‑to‑arginine substitution at position 3, changes that markedly reduce binding to IGF‑binding proteins while preserving high‑affinity activation of the IGF‑1 receptor (IGF‑1R).[web:236][web:239][web:248]\n\nResearchers use IGF‑1 LR3 to study IGF‑1R‑mediated signalling in cell growth, protein synthesis, metabolism, and tissue‑repair pathways in vitro and in preclinical animal models. It is supplied strictly as a research peptide and is not formulated or approved for human or veterinary use, therapeutic applications, or dietary supplementation.[web:237][web:239][web:248]\n\nQuick product snapshot\n\nField",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-IGF-001",
    "cas_number": "946870-92-4",
    "sequence": "83 Amino Acid Recombinant Polypeptide with Arg3 Substitution and 13-AA N-terminal Extension",
    "molecular_formula": "C400H625N111O115S9",
    "molecular_weight": 9117.6,
    "purity": "99.2% (HPLC)",
    "size": "1 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 85,
    "compare_at_price": 98,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-igf-1-lr3-1mg-box",
        "product_id": "prod-igf1-lr3-1mg",
        "image_url": "/images/labelbox/igf-1-lr3.jpg",
        "alt_text": "IGF-1 LR3 (Long R3 IGF-1) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-igf-1-lr3-1mg-vial",
        "product_id": "prod-igf1-lr3-1mg",
        "image_url": "/images/products/igf-1-lr3.jpg",
        "alt_text": "IGF-1 LR3 (Long R3 IGF-1) 1 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-igf-1-lr3-1mg-coa",
        "product_id": "prod-igf1-lr3-1mg",
        "title": "Certificate of Analysis (Batch #PB-IGF-001-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-IGF-001-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-igf-1-lr3-1mg-sds",
        "product_id": "prod-igf1-lr3-1mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-IGF-001-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-igf-1-lr3-1mg-1",
        "product_id": "prod-igf1-lr3-1mg",
        "title": "Analytical chromatography and mass spectrometric characterization of IGF-1 LR3 (Long R3 IGF-1)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-ipamorelin-5mg",
    "name": "Ipamorelin",
    "slug": "ipamorelin-5mg",
    "short_description": "Ipamorelin (10 mg) – Selective Growth Hormone Secretagogue (GHSR Agonist) Research Peptide",
    "description": "Product overview\n\nIpamorelin is a synthetic pentapeptide designed as a highly selective growth hormone secretagogue that targets the ghrelin (GHSR‑1a) receptor in laboratory models.[conversation_history:1] In contrast to earlier growth hormone–releasing peptides (GHRPs) such as GHRP‑2 and GHRP‑6, ipamorelin was engineered to stimulate robust growth hormone (GH) release while minimizing activation of other pituitary axes, including ACTH/cortisol and prolactin pathways.[conversation_history:1]\n\nBecause of this selectivity profile, ipamorelin has become a widely used research tool for studying GH secretion dynamics, ghrelin‑receptor pharmacology, and downstream metabolic and tissue‑repair pathways in controlled experimental systems.[conversation_history:1] This description is intended for research‑focused e‑commerce use and is not a guide for clinical or non‑laboratory applications.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-IPA-005",
    "cas_number": "170851-70-4",
    "sequence": "Aib-His-D-2Nal-D-Phe-Lys-NH2",
    "molecular_formula": "C38H49N9O5",
    "molecular_weight": 711.9,
    "purity": "99.5% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 54,
    "compare_at_price": 62,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-ipamorelin-5mg-box",
        "product_id": "prod-ipamorelin-5mg",
        "image_url": "/images/labelbox/ipamorelin.jpg",
        "alt_text": "Ipamorelin Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-ipamorelin-5mg-vial",
        "product_id": "prod-ipamorelin-5mg",
        "image_url": "/images/products/ipamorelin.jpg",
        "alt_text": "Ipamorelin 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-ipamorelin-5mg-coa",
        "product_id": "prod-ipamorelin-5mg",
        "title": "Certificate of Analysis (Batch #PB-IPA-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-IPA-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-ipamorelin-5mg-sds",
        "product_id": "prod-ipamorelin-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-IPA-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-ipamorelin-5mg-1",
        "product_id": "prod-ipamorelin-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Ipamorelin",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-kpv-5mg",
    "name": "KPV (alpha-MSH 11-13 Tripeptide)",
    "slug": "kpv-5mg",
    "short_description": "KPV 10 mg – α‑MSH‑Derived Anti‑Inflammatory Tripeptide (Research Grade)",
    "description": "Product overview\n\nKPV (Lys‑Pro‑Val) is a synthetic tripeptide corresponding to the C‑terminal fragment (positions 11–13) of α‑melanocyte‑stimulating hormone (α‑MSH).[web:219][web:220][web:223] This ultra‑short sequence has been widely studied for its ability to reproduce many of α‑MSH’s anti‑inflammatory and tissue‑protective effects while operating largely through melanocortin‑receptor‑independent mechanisms in experimental systems.[web:222][web:225][web:228]\n\nIn preclinical models, KPV has been investigated as a tool compound for probing NF‑κB and MAPK signalling, epithelial and mucosal barrier responses, wound‑healing dynamics, and antimicrobial peptide‑like activity under controlled laboratory conditions.[web:221][web:222][web:227] KPV 10 mg is supplied as a lyophilised research peptide designed for in‑vitro work and approved preclinical animal studies and is not formulated or approved for human or veterinary use.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-KPV-005",
    "cas_number": "67727-97-3",
    "sequence": "Lys-Pro-Val",
    "molecular_formula": "C16H31N5O4",
    "molecular_weight": 342.4,
    "purity": "99.4% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 49,
    "compare_at_price": 58,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-kpv-5mg-box",
        "product_id": "prod-kpv-5mg",
        "image_url": "/images/labelbox/kpv.jpg",
        "alt_text": "KPV (alpha-MSH 11-13 Tripeptide) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-kpv-5mg-vial",
        "product_id": "prod-kpv-5mg",
        "image_url": "/images/products/kpv.jpg",
        "alt_text": "KPV (alpha-MSH 11-13 Tripeptide) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-kpv-5mg-coa",
        "product_id": "prod-kpv-5mg",
        "title": "Certificate of Analysis (Batch #PB-KPV-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-KPV-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-kpv-5mg-sds",
        "product_id": "prod-kpv-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-KPV-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-kpv-5mg-1",
        "product_id": "prod-kpv-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of KPV (alpha-MSH 11-13 Tripeptide)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-kisspeptin-10-5mg",
    "name": "Kisspeptin-10 (KP-10)",
    "slug": "kisspeptin-10-5mg",
    "short_description": "# Kisspeptin-10 (10mg) - Complete Product Page",
    "description": "## Product Overview & Summary\n\n### Kisspeptin-10 (10mg) – Research-Grade Peptide Solution\n\nKisspeptin-10 represents a breakthrough tool for modern laboratory research, offering scientists a direct pathway to understanding reproductive regulation and broader neuroendocrine mechanisms. This synthetic peptide fragment—comprising just ten amino acids—delivers the complete biological activity of larger kisspeptin molecules, making it both efficient and cost-effective for your research endeavors.\n\nAt its core, kisspeptin-10 functions as a precise molecular key, unlocking KISS1R receptors throughout the body. Unlike many research chemicals that require complex preparation, our formulation arrives ready for integration into your existing protocols. The peptide maintains remarkable stability when stored properly, preserving its potency across multiple experimental cycles.\n\nWhat sets this product apart is its versatility. Whether your laboratory focuses on reproductive biology, cancer research, neuroprotection studies, or cardiovascular investigations, kisspeptin-10 provides reliable, consistent results. The ten-amino acid structure (Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2) contains every essential element needed for receptor binding, eliminating unnecessary bulk while maximizing research value.",
    "category_id": "cat-1",
    "category": "Neuropeptides",
    "product_code": "PB-KSP-005",
    "cas_number": "374675-21-5",
    "sequence": "Tyr-Asn-Trp-Asn-Ser-Phe-Gly-Leu-Arg-Phe-NH2",
    "molecular_formula": "C63H83N17O14",
    "molecular_weight": 1302.5,
    "purity": "99.3% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 64,
    "compare_at_price": 74,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-kisspeptin-10-5mg-box",
        "product_id": "prod-kisspeptin-10-5mg",
        "image_url": "/images/labelbox/kisspeptin.jpg",
        "alt_text": "Kisspeptin-10 (KP-10) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-kisspeptin-10-5mg-vial",
        "product_id": "prod-kisspeptin-10-5mg",
        "image_url": "/images/products/kisspeptin-10.jpg",
        "alt_text": "Kisspeptin-10 (KP-10) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-kisspeptin-10-5mg-coa",
        "product_id": "prod-kisspeptin-10-5mg",
        "title": "Certificate of Analysis (Batch #PB-KSP-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-KSP-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-kisspeptin-10-5mg-sds",
        "product_id": "prod-kisspeptin-10-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-KSP-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-kisspeptin-10-5mg-1",
        "product_id": "prod-kisspeptin-10-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Kisspeptin-10 (KP-10)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-l-carnitine-600mg",
    "name": "L-Carnitine (Injectable Grade Compound)",
    "slug": "l-carnitine-600mg",
    "short_description": "L‑Carnitine 600 mg – Fatty Acid Transport and Mitochondrial Metabolism Research Grade Compound",
    "description": "Product overview\n\nL‑Carnitine is a naturally occurring quaternary ammonium compound (β‑hydroxy‑γ‑N‑trimethylaminobutyric acid) biosynthesised from lysine and methionine and present in most mammalian tissues.[web:202][web:205][web:211] As a zwitterionic small molecule, it plays a central role in mitochondrial fatty acid β‑oxidation by enabling long‑chain acyl‑CoA esters to cross the inner mitochondrial membrane via the carnitine shuttle system (CPT I, carnitine–acylcarnitine translocase, CPT II).[web:203][web:206][web:212]\n\nThe L‑Carnitine 600 mg format provides a versatile quantity of high‑purity crystalline material suitable for studies of energy metabolism, lipid utilisation, mitochondrial function, oxidative stress, and age‑related metabolic decline in cell culture, isolated organ preparations, and small‑animal models. This material is intended strictly for laboratory research use and is not approved for human or veterinary consumption.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-LCR-600",
    "cas_number": "541-15-1",
    "sequence": "(R)-(3-Carboxy-2-hydroxypropyl)trimethylammonium hydroxide inner salt",
    "molecular_formula": "C7H15NO3",
    "molecular_weight": 161.2,
    "purity": "99.9% (HPLC)",
    "size": "600 mg / 10 mL",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 39,
    "compare_at_price": 48,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-l-carnitine-600mg-box",
        "product_id": "prod-l-carnitine-600mg",
        "image_url": "/images/labelbox/l-carnitine.jpg",
        "alt_text": "L-Carnitine (Injectable Grade Compound) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-l-carnitine-600mg-vial",
        "product_id": "prod-l-carnitine-600mg",
        "image_url": "/images/products/l-carnitine.jpg",
        "alt_text": "L-Carnitine (Injectable Grade Compound) 600 mg / 10 mL Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-l-carnitine-600mg-coa",
        "product_id": "prod-l-carnitine-600mg",
        "title": "Certificate of Analysis (Batch #PB-LCR-600-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-LCR-600-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-l-carnitine-600mg-sds",
        "product_id": "prod-l-carnitine-600mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-LCR-600-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-l-carnitine-600mg-1",
        "product_id": "prod-l-carnitine-600mg",
        "title": "Analytical chromatography and mass spectrometric characterization of L-Carnitine (Injectable Grade Compound)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-mots-c-10mg",
    "name": "MOTS-c (Mitochondrial-Derived Peptide)",
    "slug": "mots-c-10mg",
    "short_description": "MOTS-c (10 mg) – Research Peptide Product Description",
    "description": "Product overview\n\nMOTS-c is a short, 16–amino acid peptide encoded in the mitochondrial 12S rRNA gene, classed in the literature as a mitochondrial‑derived peptide (MDP).[file:23] It is widely used as a research tool to explore how mitochondria communicate with the rest of the cell, how cells sense energy stress, and how metabolic pathways adapt in models of obesity, insulin resistance, exercise, and aging.[file:23] This 10 mg MOTS‑c vial is offered as a high‑purity research material for qualified laboratories that require a consistent, well‑documented peptide for in‑vitro and preclinical work.\n\nThis page is written for an e‑commerce setting, but all information relates to laboratory research only. No part of this description should be interpreted as medical or therapeutic guidance.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-MOT-010",
    "cas_number": "1627580-64-6",
    "sequence": "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
    "molecular_formula": "C101H152N28O22S2",
    "molecular_weight": 2174.6,
    "purity": "99.0% (HPLC)",
    "size": "10 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 95,
    "compare_at_price": 110,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-mots-c-10mg-box",
        "product_id": "prod-mots-c-10mg",
        "image_url": "/images/labelbox/mots-c.jpg",
        "alt_text": "MOTS-c (Mitochondrial-Derived Peptide) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-mots-c-10mg-vial",
        "product_id": "prod-mots-c-10mg",
        "image_url": "/images/products/mots-c.jpg",
        "alt_text": "MOTS-c (Mitochondrial-Derived Peptide) 10 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-mots-c-10mg-coa",
        "product_id": "prod-mots-c-10mg",
        "title": "Certificate of Analysis (Batch #PB-MOT-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-MOT-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-mots-c-10mg-sds",
        "product_id": "prod-mots-c-10mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-MOT-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-mots-c-10mg-1",
        "product_id": "prod-mots-c-10mg",
        "title": "Analytical chromatography and mass spectrometric characterization of MOTS-c (Mitochondrial-Derived Peptide)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-nad-plus-500mg",
    "name": "NAD+ (Nicotinamide Adenine Dinucleotide)",
    "slug": "nad-plus-500mg",
    "short_description": "NAD⁺ 500 mg – Nicotinamide Adenine Dinucleotide Research Grade Coenzyme",
    "description": "Product overview\n\nNicotinamide adenine dinucleotide (NAD⁺) is an oxidized dinucleotide coenzyme present in all living cells and central to cellular metabolism.[web:180][web:186][web:189] It cycles between oxidized (NAD⁺) and reduced (NADH) states to support redox reactions in glycolysis, the tricarboxylic acid (TCA) cycle, β‑oxidation, and oxidative phosphorylation.[web:180][web:186][web:192] Beyond its classical electron‑carrier role, NAD⁺ serves as a consumable substrate for multiple enzyme families including sirtuins, PARPs, and CD38/CD157, linking cellular energy status to gene regulation, DNA repair, and stress‑response pathways.[web:184][web:187][web:190]\n\nThe NAD⁺ 500 mg presentation provides a high‑capacity vial of research‑grade, lyophilized coenzyme suitable for metabolic, mitochondrial, aging, and disease‑mechanism studies that require repeated dosing or large experimental cohorts. This material is intended strictly for in‑vitro use and preclinical animal research and is not approved for human consumption or therapeutic application.[web:182][web:183][web:194]\n\nQuick product snapshot\n\nField",
    "category_id": "cat-3",
    "category": "Longevity & Epigenetics",
    "product_code": "PB-NAD-500",
    "cas_number": "53-84-9",
    "sequence": "beta-Nicotinamide Adenine Dinucleotide Hydrate",
    "molecular_formula": "C21H27N7O14P2",
    "molecular_weight": 663.43,
    "purity": "99.6% (HPLC)",
    "size": "500 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 89,
    "compare_at_price": 105,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-nad-plus-500mg-box",
        "product_id": "prod-nad-plus-500mg",
        "image_url": "/images/labelbox/nadplus.jpg",
        "alt_text": "NAD+ (Nicotinamide Adenine Dinucleotide) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-nad-plus-500mg-vial",
        "product_id": "prod-nad-plus-500mg",
        "image_url": "/images/products/nadplus.jpg",
        "alt_text": "NAD+ (Nicotinamide Adenine Dinucleotide) 500 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-nad-plus-500mg-coa",
        "product_id": "prod-nad-plus-500mg",
        "title": "Certificate of Analysis (Batch #PB-NAD-500-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-NAD-500-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-nad-plus-500mg-sds",
        "product_id": "prod-nad-plus-500mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-NAD-500-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-nad-plus-500mg-1",
        "product_id": "prod-nad-plus-500mg",
        "title": "Analytical chromatography and mass spectrometric characterization of NAD+ (Nicotinamide Adenine Dinucleotide)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-peg-mgf-2mg",
    "name": "PEG-MGF (Pegylated Mechano Growth Factor)",
    "slug": "peg-mgf-2mg",
    "short_description": "# PEG-MGF (Pegylated Mechano Growth Factor) — Product Overview",
    "description": "**PEG-MGF** is a stabilized research peptide designed to support advanced studies in muscle growth and regeneration. Derived from mechano growth factor—a muscle-specific splice variant of IGF-1—PEG-MGF achieves a much longer circulation time through pegylation. This technique attaches a polyethylene glycol (PEG) group to the natural peptide sequence, increasing half-life, reducing breakdown, and enabling convenient systemic investigation.\n\n**Native MGF** is created by muscle under stress to stimulate stem cell activation and tissue repair, but its lifespan in the body is only minutes. PEG-MGF overcomes this limitation, remaining bioactive in circulation for 48–72 hours, and lets researchers study muscle, cardiac, neural, and bone repair in much greater detail.\n\n---\n\n## Potential Benefits* (Research Focus Only)\n- Supports muscle fiber repair and growth studies  \n- Accelerates recovery in injury models  \n- Investigates bone and cartilage regeneration  \n- Allows for cardiac and neuroprotection exploration  \n- Serves in age-related muscle loss research  \n- Examines systemic vs. localized tissue effects\n\n> *For laboratory and preclinical research only. Not for human or clinical use.",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-MGF-002",
    "cas_number": "918074-21-6",
    "sequence": "Tyr-Gln-Pro-Pro-Ser-Thr-Asn-Lys-Asn-Thr-Lys-Ser-Gln-Arg-Arg-Lys-Gly-Ser-Thr-Phe-Glu-Glu-His-Lys-PEG",
    "molecular_formula": "C121H200N42O39 (pep base) + PEG",
    "molecular_weight": 2867,
    "purity": "99.1% (HPLC)",
    "size": "2 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 69,
    "compare_at_price": 79,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-peg-mgf-2mg-box",
        "product_id": "prod-peg-mgf-2mg",
        "image_url": "/images/labelbox/peg-mgf.jpg",
        "alt_text": "PEG-MGF (Pegylated Mechano Growth Factor) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-peg-mgf-2mg-vial",
        "product_id": "prod-peg-mgf-2mg",
        "image_url": "/images/products/peg-mgf.jpg",
        "alt_text": "PEG-MGF (Pegylated Mechano Growth Factor) 2 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-peg-mgf-2mg-coa",
        "product_id": "prod-peg-mgf-2mg",
        "title": "Certificate of Analysis (Batch #PB-MGF-002-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-MGF-002-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-peg-mgf-2mg-sds",
        "product_id": "prod-peg-mgf-2mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-MGF-002-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-peg-mgf-2mg-1",
        "product_id": "prod-peg-mgf-2mg",
        "title": "Analytical chromatography and mass spectrometric characterization of PEG-MGF (Pegylated Mechano Growth Factor)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-pt-141-5mg",
    "name": "PT-141 (Bremelanotide)",
    "slug": "pt-141-bremelanotide-5mg",
    "short_description": "PT‑141 5 mg – Melanocortin Receptor Agonist Research Peptide",
    "description": "Product overview\n\nPT‑141 (bremelanotide) is a synthetic cyclic heptapeptide derived from the melanocortin analogue α‑MSH and structurally related to melanotan II.[web:161][web:164][web:170] It acts as a melanocortin receptor agonist with primary activity at MC3R and MC4R in the central nervous system, making it a useful tool for studying melanocortin‑mediated signalling, neuroendocrine regulation, and sexual‑function pathways in preclinical models.[web:161][web:163][web:167]\n\nThe PT‑141 5 mg presentation provides a defined amount of lyophilized peptide suitable for in‑vitro assays and in‑vivo animal studies where moderate quantities and fine dose‑response work are required. This material is intended strictly for laboratory research and is not approved for human or veterinary use.[web:163][web:166][web:170]\n\nQuick product snapshot\n\nField",
    "category_id": "cat-1",
    "category": "Neuropeptides",
    "product_code": "PB-PT141-005",
    "cas_number": "189745-98-8",
    "sequence": "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
    "molecular_formula": "C50H68N14O10",
    "molecular_weight": 1025.2,
    "purity": "99.5% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 58,
    "compare_at_price": 68,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-pt-141-bremelanotide-5mg-box",
        "product_id": "prod-pt-141-5mg",
        "image_url": "/images/labelbox/pt-141.jpg",
        "alt_text": "PT-141 (Bremelanotide) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-pt-141-bremelanotide-5mg-vial",
        "product_id": "prod-pt-141-5mg",
        "image_url": "/images/products/pt-141.jpg",
        "alt_text": "PT-141 (Bremelanotide) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-pt-141-bremelanotide-5mg-coa",
        "product_id": "prod-pt-141-5mg",
        "title": "Certificate of Analysis (Batch #PB-PT141-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-PT141-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-pt-141-bremelanotide-5mg-sds",
        "product_id": "prod-pt-141-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-PT141-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-pt-141-bremelanotide-5mg-1",
        "product_id": "prod-pt-141-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of PT-141 (Bremelanotide)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-retatrutide-10mg",
    "name": "Retatrutide (GIP/GLP-1/Glucagon Triple Agonist)",
    "slug": "retatrutide-10mg",
    "short_description": "Retatrutide (10 mg) – Triple Incretin Receptor Agonist Research Peptide",
    "description": "Product overview\n\nRetatrutide (also referred to in some research materials as LY3437943 or \"Reta\") is an investigational synthetic peptide designed as a balanced triple agonist at the GLP‑1, GIP, and glucagon receptors.[conversation_history:1] In laboratory and clinical research models, this multi‑pathway profile is used to study energy balance, body‑weight regulation, glucose homeostasis, and liver fat metabolism.[conversation_history:1]\n\nThis description is written for a research‑only e‑commerce context. It is intended to help laboratories understand how retatrutide fits into metabolic and endocrine research workflows. It is not guidance for treatment, dosing, or any non‑research use.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-RET-010",
    "cas_number": "2381089-83-2",
    "sequence": "39-amino acid synthetic peptide with C20 fatty diacid moiety",
    "molecular_formula": "C221H342N46O68",
    "molecular_weight": 4731.42,
    "purity": "99.4% (HPLC)",
    "size": "10 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 135,
    "compare_at_price": 155,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-retatrutide-10mg-box",
        "product_id": "prod-retatrutide-10mg",
        "image_url": "/images/labelbox/retatrutide.jpg",
        "alt_text": "Retatrutide (GIP/GLP-1/Glucagon Triple Agonist) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-retatrutide-10mg-vial",
        "product_id": "prod-retatrutide-10mg",
        "image_url": "/images/products/retatrutide.jpg",
        "alt_text": "Retatrutide (GIP/GLP-1/Glucagon Triple Agonist) 10 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-retatrutide-10mg-coa",
        "product_id": "prod-retatrutide-10mg",
        "title": "Certificate of Analysis (Batch #PB-RET-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-RET-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-retatrutide-10mg-sds",
        "product_id": "prod-retatrutide-10mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-RET-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-retatrutide-10mg-1",
        "product_id": "prod-retatrutide-10mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Retatrutide (GIP/GLP-1/Glucagon Triple Agonist)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-selank-5mg",
    "name": "Selank (5mg)",
    "slug": "selank-5mg",
    "short_description": "Selank 5 mg – Synthetic Tuftsin Heptapeptide Analog",
    "description": "Product overview\n\nSelank is a synthetic seven-amino acid regulatory neuropeptide with the sequence Thr-Lys-Pro-Arg-Pro-Gly-Pro, developed as a stabilized analog of the endogenous immunomodulatory tetrapeptide tuftsin (Thr-Lys-Pro-Arg). The structural addition of the C-terminal Pro-Gly-Pro tripeptide protects the compound from rapid enzymatic degradation by circulating carboxypeptidases and aminopeptidases, significantly prolonging central nervous system bioavailability in experimental models.\n\nIn preclinical neurobiology, Selank is investigated for its allosteric modulation of GABA-A receptors, upregulation of brain-derived neurotrophic factor (BDNF) and TrkB receptor mRNA in hippocampal tissue, and competitive inhibition of enkephalin-degrading enzymes without exhibiting sedative, addictive, or myorelaxant properties. The product is supplied as a sterile, white lyophilized solid powder with certified HPLC purity (≥99%) and identity confirmed by mass spectrometry.\n\nThis material is intended strictly for in-vitro laboratory experimentation and approved preclinical research. It is not approved for human or veterinary use.\n\nQuick product snapshot",
    "category_id": "cat-1",
    "category": "Neuropeptides",
    "product_code": "PB-SLK-005",
    "cas_number": "129954-34-3",
    "sequence": "Thr-Lys-Pro-Arg-Pro-Gly-Pro",
    "molecular_formula": "C33H57N11O9",
    "molecular_weight": 751.87,
    "purity": "99.4% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 68,
    "compare_at_price": 78,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-selank-5mg-box",
        "product_id": "prod-selank-5mg",
        "image_url": "/images/labelbox/selank.jpg",
        "alt_text": "Selank Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-selank-5mg-vial",
        "product_id": "prod-selank-5mg",
        "image_url": "/images/products/selank.jpg",
        "alt_text": "Selank 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-selank-5mg-coa",
        "product_id": "prod-selank-5mg",
        "title": "Certificate of Analysis (Batch #PB-SLK-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-SLK-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-selank-5mg-sds",
        "product_id": "prod-selank-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-SLK-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-selank-5mg-1",
        "product_id": "prod-selank-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Selank",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-semax-5mg",
    "name": "Semax",
    "slug": "semax-5mg",
    "short_description": "# Semax 5 mg",
    "description": "**Research use only. Not for human consumption.**\n\nSemax is a synthetic heptapeptide studied in laboratory settings for its role in neurobiology, stress response, and cognitive research. It is a stabilized analogue of the ACTH (4-10) fragment and is commonly used in preclinical and in vitro research where a well-defined peptide is needed for controlled experiments.\n\nThis listing is for **Semax 5 mg** in a lyophilized powder format.\n\n## Product Highlights\n\n- Synthetic ACTH (4-10) analogue\n- White to off-white lyophilized powder\n- Purity: **≥99% by HPLC**\n- Available in **5 mg** and **10 mg** vial formats\n- Intended for **laboratory research only**\n- Not intended for human or veterinary use",
    "category_id": "cat-1",
    "category": "Neuropeptides",
    "product_code": "PB-SMX-005",
    "cas_number": "80714-61-0",
    "sequence": "Met-Glu-His-Phe-Pro-Gly-Pro",
    "molecular_formula": "C37H51N9O10S",
    "molecular_weight": 813.93,
    "purity": "99.2% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 74,
    "compare_at_price": 85,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-semax-5mg-box",
        "product_id": "prod-semax-5mg",
        "image_url": "/images/labelbox/semax.jpg",
        "alt_text": "Semax Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-semax-5mg-vial",
        "product_id": "prod-semax-5mg",
        "image_url": "/images/products/semax.jpg",
        "alt_text": "Semax 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-semax-5mg-coa",
        "product_id": "prod-semax-5mg",
        "title": "Certificate of Analysis (Batch #PB-SMX-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-SMX-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-semax-5mg-sds",
        "product_id": "prod-semax-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-SMX-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-semax-5mg-1",
        "product_id": "prod-semax-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Semax",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-tb-500-5mg",
    "name": "TB-500 (Thymosin Beta-4)",
    "slug": "tb-500-5mg",
    "short_description": "TB-500 (10 mg) – Thymosin Beta-4 Research Peptide Material Description",
    "description": "Product overview\n\nTB‑500 is a synthetic research peptide corresponding to the full 43–amino acid sequence of thymosin beta‑4 (Tβ4), a naturally occurring peptide found in a wide range of mammalian tissues and circulating fluids.[file:23] Thymosin beta‑4 has been described in the literature as a multifunctional regulator of tissue repair, cell migration, angiogenesis, inflammatory resolution, and cytoskeletal organization, making TB‑500 a useful tool compound for exploring these mechanisms in laboratory models.[file:23]\n\nThis description is written for use on a research‑focused e‑commerce site and is intended to support in‑vitro and preclinical experimental planning only. Nothing here should be interpreted as medical advice, treatment guidance, or a recommendation for any non‑research use.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-2",
    "category": "Cellular & Tissue Research",
    "product_code": "PB-TB4-005",
    "cas_number": "77591-33-4",
    "sequence": "Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser",
    "molecular_formula": "C212H350N56O78S",
    "molecular_weight": 4963.4,
    "purity": "99.1% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 88,
    "compare_at_price": 98,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-tb-500-5mg-box",
        "product_id": "prod-tb-500-5mg",
        "image_url": "/images/labelbox/tb-500.jpg",
        "alt_text": "TB-500 (Thymosin Beta-4) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-tb-500-5mg-vial",
        "product_id": "prod-tb-500-5mg",
        "image_url": "/images/products/tb-500.jpg",
        "alt_text": "TB-500 (Thymosin Beta-4) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-tb-500-5mg-coa",
        "product_id": "prod-tb-500-5mg",
        "title": "Certificate of Analysis (Batch #PB-TB4-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-TB4-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-tb-500-5mg-sds",
        "product_id": "prod-tb-500-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-TB4-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-tb-500-5mg-1",
        "product_id": "prod-tb-500-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of TB-500 (Thymosin Beta-4)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-tesamorelin-5mg",
    "name": "Tesamorelin (trans-3-Hexenoyl GHRH)",
    "slug": "tesamorelin-5mg",
    "short_description": "Tesamorelin (10 mg) – Growth Hormone–Releasing Hormone (GHRH) Analog Research Peptide",
    "description": "Product overview\n\nTesamorelin is a synthetic 44–amino acid peptide that closely mirrors native human growth hormone–releasing hormone (GHRH) and includes a protective trans‑3‑hexenoic acid group at the N‑terminus to improve stability in circulation.[conversation_history:1] In research models, it is widely used to stimulate the pituitary gland to release endogenous growth hormone, allowing investigators to explore growth hormone/IGF‑1 axis biology, visceral fat regulation, and broader metabolic pathways.[conversation_history:1]\n\nThis description is written specifically for a research‑focused e‑commerce site. It is intended to help laboratories understand how tesamorelin fits into experimental designs, not to guide medical use or any non‑research application.\n\nQuick product snapshot\n\nField",
    "category_id": "cat-6",
    "category": "Growth Hormone Secretagogues",
    "product_code": "PB-TSM-005",
    "cas_number": "218949-48-5",
    "sequence": "trans-3-Hexenoyl-[Tyr1, Ala2, Asp3, Ala4, Ile5, Phe6, Thr7, Asn8, Ser9, Tyr10, Arg11, Lys12, Val13, Leu14, Gly15, Gln16, Leu17, Ser18, Ala19, Arg20, Lys21, Leu22, Leu23, Gln24, Asp25, Ile26, Met27, Ser28, Arg29, Gln30, Gln31, Gly32, Glu33, Ser34, Asn35, Gln36, Glu37, Arg38, Gly39, Ala40, Arg41, Ala42, Arg43, Leu44]-NH2",
    "molecular_formula": "C221H366N72O67S",
    "molecular_weight": 5135.86,
    "purity": "99.4% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 92,
    "compare_at_price": 108,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-tesamorelin-5mg-box",
        "product_id": "prod-tesamorelin-5mg",
        "image_url": "/images/labelbox/tesamorelin.jpg",
        "alt_text": "Tesamorelin (trans-3-Hexenoyl GHRH) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-tesamorelin-5mg-vial",
        "product_id": "prod-tesamorelin-5mg",
        "image_url": "/images/products/tesamorelin.jpg",
        "alt_text": "Tesamorelin (trans-3-Hexenoyl GHRH) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-tesamorelin-5mg-coa",
        "product_id": "prod-tesamorelin-5mg",
        "title": "Certificate of Analysis (Batch #PB-TSM-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-TSM-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-tesamorelin-5mg-sds",
        "product_id": "prod-tesamorelin-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-TSM-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-tesamorelin-5mg-1",
        "product_id": "prod-tesamorelin-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Tesamorelin (trans-3-Hexenoyl GHRH)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-tirzepatide-10mg",
    "name": "Tirzepatide (Dual GIP/GLP-1 Receptor Agonist)",
    "slug": "tirzepatide-10mg",
    "short_description": "Tirzepatide",
    "description": "GLP-1 / GIP Dual Receptor Agonist  |  20mg  |  Research Grade\n\n99%+ Purity   |   Korean Manufactured   |   GMP Standards   |   Lyophilized Powder\n\n⚠️ For In Vitro Laboratory Research Only — Not for Human or Veterinary Use\n\nWhat Is Tirzepatide?\n\nTirzepatide is a synthetic 39-amino acid peptide engineered to activate two separate but related hormone receptors simultaneously — the glucagon-like peptide-1 receptor (GLP-1R) and the glucose-dependent insulinotropic polypeptide receptor (GIPR). This makes it what researchers call a dual incretin agonist, a class of compounds that mimics two naturally occurring gut hormones at once.",
    "category_id": "cat-4",
    "category": "Metabolic Peptides",
    "product_code": "PB-TRZ-010",
    "cas_number": "2023788-19-2",
    "sequence": "Tyr-Aib-Glu-Gly-Thr-Phe-Thr-Ser-Asp-Tyr-Ser-Ile-Aib-Leu-Asp-Lys-Ile-Ala-Gln-Lys(diacid-PEG)-Ala-Phe-Val-Gln-Trp-Leu-Ile-Ala-Gly-Gly-Pro-Ser-Ser-Gly-Ala-Pro-Pro-Pro-Ser-NH2",
    "molecular_formula": "C225H348N48O68",
    "molecular_weight": 4813.48,
    "purity": "99.5% (HPLC)",
    "size": "10 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 120,
    "compare_at_price": 140,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": true,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-tirzepatide-10mg-box",
        "product_id": "prod-tirzepatide-10mg",
        "image_url": "/images/labelbox/tirzepatide.jpg",
        "alt_text": "Tirzepatide (Dual GIP/GLP-1 Receptor Agonist) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-tirzepatide-10mg-vial",
        "product_id": "prod-tirzepatide-10mg",
        "image_url": "/images/products/tirzepatide.jpg",
        "alt_text": "Tirzepatide (Dual GIP/GLP-1 Receptor Agonist) 10 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-tirzepatide-10mg-coa",
        "product_id": "prod-tirzepatide-10mg",
        "title": "Certificate of Analysis (Batch #PB-TRZ-010-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-TRZ-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-tirzepatide-10mg-sds",
        "product_id": "prod-tirzepatide-10mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-TRZ-010-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-tirzepatide-10mg-1",
        "product_id": "prod-tirzepatide-10mg",
        "title": "Analytical chromatography and mass spectrometric characterization of Tirzepatide (Dual GIP/GLP-1 Receptor Agonist)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  },
  {
    "id": "prod-vip-5mg",
    "name": "VIP (Vasoactive Intestinal Peptide)",
    "slug": "vip-5mg",
    "short_description": "# VIP — Vasoactive Intestinal Peptide (5mg)",
    "description": "**Research Grade | 99%+ Purity | Korean Manufactured | GMP Standards | Lyophilized Powder**\n\n> ⚠️ **For In Vitro Laboratory Research Only.** Not for human or animal consumption. Not approved for therapeutic, diagnostic, or clinical use.\n\n---\n\n## What Is VIP?\n\nVasoactive Intestinal Peptide — VIP for short — is a 28-amino acid neuropeptide that belongs to the secretin and glucagon peptide superfamily, a family of structurally related regulatory hormones that includes secretin, glucagon, PACAP (pituitary adenylate cyclase-activating polypeptide), and PHI (peptide histidine isoleucine). It was first isolated in 1970 by Said and Mutt from porcine small intestinal tissue, where its original characterisation focused on its potent vasodilatory activity. That first impression turned out to be only a narrow slice of VIP's biological portfolio.",
    "category_id": "cat-1",
    "category": "Neuropeptides",
    "product_code": "PB-VIP-005",
    "cas_number": "37221-79-7",
    "sequence": "His-Ser-Asp-Ala-Val-Phe-Thr-Asp-Asn-Tyr-Thr-Arg-Leu-Arg-Lys-Gln-Met-Ala-Val-Lys-Lys-Tyr-Leu-Asn-Ser-Ile-Leu-Asn-NH2",
    "molecular_formula": "C147H238N44O42S",
    "molecular_weight": 3325.8,
    "purity": "99.4% (HPLC)",
    "size": "5 mg",
    "format": "Lyophilized Solid / Sealed Sterile Vial",
    "price": 72,
    "compare_at_price": 84,
    "stock_quantity": 40,
    "is_active": true,
    "is_featured": false,
    "research_use_only": true,
    "storage_information": "Store lyophilized vial at -20°C upon receipt. Protect from light, heat, and moisture.",
    "created_at": "2025-01-15T00:00:00Z",
    "updated_at": "2025-02-20T00:00:00Z",
    "images": [
      {
        "id": "img-vip-5mg-box",
        "product_id": "prod-vip-5mg",
        "image_url": "/images/labelbox/vip.jpg",
        "alt_text": "VIP (Vasoactive Intestinal Peptide) Sealed Packaging Box",
        "sort_order": 0,
        "is_primary": true
      },
      {
        "id": "img-vip-5mg-vial",
        "product_id": "prod-vip-5mg",
        "image_url": "/images/products/vip.jpg",
        "alt_text": "VIP (Vasoactive Intestinal Peptide) 5 mg Lyophilized Vial",
        "sort_order": 1,
        "is_primary": false
      }
    ],
    "documents": [
      {
        "id": "doc-vip-5mg-coa",
        "product_id": "prod-vip-5mg",
        "title": "Certificate of Analysis (Batch #PB-VIP-005-2025)",
        "document_type": "COA",
        "file_url": "#coa",
        "batch_number": "PB-VIP-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      },
      {
        "id": "doc-vip-5mg-sds",
        "product_id": "prod-vip-5mg",
        "title": "Safety Data Sheet (SDS)",
        "document_type": "SDS",
        "file_url": "#sds",
        "batch_number": "PB-VIP-005-2025",
        "test_date": "2025-01-20",
        "is_public": true
      }
    ],
    "references": [
      {
        "id": "ref-vip-5mg-1",
        "product_id": "prod-vip-5mg",
        "title": "Analytical chromatography and mass spectrometric characterization of VIP (Vasoactive Intestinal Peptide)",
        "authors": "Bio-Analytical Chemistry Group",
        "publication": "Journal of Peptide Science & Analytical Chemistry",
        "year": 2024,
        "url": "https://doi.org/10.1002/psc.3400"
      }
    ]
  }
];
