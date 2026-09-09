import { Product } from '@/types';

export interface ResearchAreaItem {
  title: string;
  description: string;
  iconType: 'activity' | 'scale' | 'dna' | 'flame' | 'clock' | 'heart' | 'shield' | 'zap' | 'brain' | 'flask';
}

export function cleanProductDescription(rawDesc?: string): string[] {
  if (!rawDesc) {
    return [
      'High-purity synthetic research peptide formulation manufactured under strict quality assurance controls for in vitro laboratory investigations and biochemical assays.',
      'Supplied as a sterile, lyophilized solid offering exceptional stability for quantitative receptor binding, chromatography calibration, and metabolic signaling studies.'
    ];
  }

  // Strip file tags, web tags, footnotes, and scraper markers
  let text = rawDesc
    .replace(/\[file:\d+\]/gi, '')
    .replace(/\[web:\d+\]/gi, '')
    .replace(/\[\d+\]/gi, '')
    .replace(/Product overview\s*/gi, '')
    .replace(/##\s*Product overview\s*/gi, '')
    .replace(/Quick product snapshot[\s\S]*$/gi, '')
    .replace(/##\s*Quick product snapshot[\s\S]*$/gi, '')
    .replace(/Field[\s\S]*$/gi, '')
    .replace(/This page is written for an e[\s\S]*$/gi, '')
    .replace(/Don't forget your BAC water[\s\S]*$/gi, '')
    .replace(/---\s*$/gi, '')
    .trim();

  // Split by double newlines or markdown sections
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .map((p) => p.replace(/^>\s*/, '').replace(/^\*\*Research Grade[^*]*\*\*/i, '').replace(/^#+\s*[^\n]+\n*/g, '').trim())
    .filter((p) => p.length > 20 && !p.startsWith('|') && !p.startsWith('#') && !p.startsWith('*') && !p.startsWith('-'));

  if (paragraphs.length === 0) {
    return [
      'High-purity synthetic research peptide formulation manufactured under strict quality assurance controls for in vitro laboratory investigations and biochemical assays.',
      'Supplied as a sterile, lyophilized solid offering exceptional stability for quantitative receptor binding, chromatography calibration, and metabolic signaling studies.'
    ];
  }

  return paragraphs;
}

export function getProductSummary(product: Product): string {
  const paragraphs = cleanProductDescription(product.description);
  if (paragraphs && paragraphs.length > 0) {
    return paragraphs[0];
  }
  return (
    product.short_description ||
    `${product.name} is a high-purity synthetic peptide sequence evaluated in laboratory in vitro and preclinical research models with certified analytical purity.`
  );
}

export function getProductResearchAreas(product: Product): ResearchAreaItem[] {
  const slug = product.slug?.toLowerCase() || '';
  const name = product.name?.toLowerCase() || '';
  const category = (product.category || '').toLowerCase();

  // 1. BPC-157 & Blends
  if (slug.includes('bpc-157') || name.includes('bpc-157')) {
    return [
      {
        title: 'Angiogenesis & VEGF Expression',
        description: 'Promotes local endothelial tube formation, VEGFR2 phosphorylation, and capillary outgrowth in tissue injury models.',
        iconType: 'activity'
      },
      {
        title: 'Tendon & Ligament Repair',
        description: 'Upregulates type I collagen synthesis, tendon explant outgrowth, and biomechanical tensile recovery.',
        iconType: 'dna'
      },
      {
        title: 'Gastrointestinal Cytoprotection',
        description: 'Maintains mucosal barrier integrity, regulates nitric oxide (NO) synthase, and mitigates inflammatory bowel stress.',
        iconType: 'shield'
      },
      {
        title: 'Extracellular Matrix Remodeling',
        description: 'Accelerates granulation tissue deposition, focal adhesion kinase (FAK) activation, and wound closure kinetics.',
        iconType: 'flame'
      }
    ];
  }

  // 2. TB-500 (Thymosin Beta-4)
  if (slug.includes('tb-500') || name.includes('tb-500')) {
    return [
      {
        title: 'Actin Sequestration & Motility',
        description: 'Binds G-actin monomer pools to regulate cytoskeletal dynamics, cell migration, and rapid cellular mobilization.',
        iconType: 'activity'
      },
      {
        title: 'Anti-Fibrotic Signaling',
        description: 'Suppresses myofibroblast differentiation and excess collagen cross-linking to minimize pathological scar formation.',
        iconType: 'shield'
      },
      {
        title: 'Endothelial Cell Migration',
        description: 'Stimulates microvascular endothelial cell sprouting, capillary lumen formation, and tissue revascularization.',
        iconType: 'flame'
      },
      {
        title: 'Myocardial & Soft Tissue Protection',
        description: 'Upregulates cell survival kinases (Akt/PKB) to preserve tissue viability following ischemic or mechanical stress.',
        iconType: 'heart'
      }
    ];
  }

  // 3. Bacteriostatic Water / Reconstitution
  if (slug.includes('bacteriostatic') || category.includes('reconstitution')) {
    return [
      {
        title: '0.9% Benzyl Alcohol Preservation',
        description: 'Provides validated antimicrobial efficacy, inhibiting microbial proliferation in multi-withdrawal laboratory vials.',
        iconType: 'shield'
      },
      {
        title: 'USP Reconstitution Standard',
        description: 'Sterile, non-pyrogenic aqueous medium meeting pharmacopeial purity guidelines for analytical peptide dissolution.',
        iconType: 'flask'
      },
      {
        title: 'Peptide Solution Longevity',
        description: 'Maintains compound stability, prevents peptide precipitation, and extends viable multi-dose laboratory storage at 4°C.',
        iconType: 'clock'
      },
      {
        title: 'Lot-Traceable Analytical Vehicle',
        description: 'Batch-tested for endotoxins, particulate matter, and pH balance (4.5–7.0) for consistent assay calibration.',
        iconType: 'activity'
      }
    ];
  }

  // 4. Semax / Selank (Neuropeptides)
  if (slug.includes('semax') || slug.includes('selank') || name.includes('semax') || name.includes('selank')) {
    return [
      {
        title: 'BDNF & NGF Neurotrophin Modulation',
        description: 'Rapidly upregulates brain-derived neurotrophic factor (BDNF) and trkB receptor signaling in neuronal cultures.',
        iconType: 'brain'
      },
      {
        title: 'Neurotransmitter Turnover Kinetics',
        description: 'Regulates central dopamine, serotonin (5-HT), and GABAergic signaling without sedative or addictive properties.',
        iconType: 'activity'
      },
      {
        title: 'Neuroprotective Ischemic Defense',
        description: 'Mitigates oxidative glutamate toxicity, reduces pro-inflammatory cytokine expression, and stabilizes neural membranes.',
        iconType: 'shield'
      },
      {
        title: 'Cognitive & Memory Consolidation',
        description: 'Enhances synaptic plasticity, long-term potentiation (LTP), and attention performance in experimental cognitive models.',
        iconType: 'zap'
      }
    ];
  }

  // 4.1 AOD-9604 / HGH Fragment
  if (slug.includes('aod') || slug.includes('fragment') || name.includes('aod') || name.includes('fragment')) {
    return [
      {
        title: 'Adipocyte Lipolysis Signaling',
        description: 'Stimulates beta-3 adrenergic receptor pathways and intracellular hormone-sensitive lipase (HSL) for lipid mobilization.',
        iconType: 'flame'
      },
      {
        title: 'Non-Glycemic Profile',
        description: 'Exerts lipolytic actions without inducing insulin resistance, hyperglycemia, or elevating circulating IGF-1 in research assays.',
        iconType: 'scale'
      },
      {
        title: 'Anti-Lipogenic Inhibition',
        description: 'Inhibits acetyl-CoA carboxylase (ACC) and fatty acid synthase (FAS) to suppress new fatty acid synthesis in adipocytes.',
        iconType: 'shield'
      },
      {
        title: 'Chondrogenesis & Extracellular Matrix',
        description: 'Investigated in joint tissue models for promoting hyaline cartilage proteoglycan deposition and chondrocyte viability.',
        iconType: 'dna'
      }
    ];
  }

  // 5. Retatrutide / Tirzepatide (Incretin Mimetics)
  if (slug.includes('retatrutide') || slug.includes('tirzepatide') || name.includes('retatrutide') || name.includes('tirzepatide')) {
    return [
      {
        title: 'Multi-Agonist Receptor Kinetics',
        description: 'Engages GLP-1, GIP, and Glucagon (GCGR) receptor complexes with balanced nanomolar affinity profiles.',
        iconType: 'activity'
      },
      {
        title: 'Adiposity & Lipid Catabolism',
        description: 'Stimulates brown adipose thermogenesis, hepatic lipid export, and intracellular lipolysis pathways.',
        iconType: 'flame'
      },
      {
        title: 'Glycemic & Insulin Sensitization',
        description: 'Enhances glucose-dependent insulin secretion while lowering glucagon secretion during hyperglycemic phases.',
        iconType: 'scale'
      },
      {
        title: 'Cardiometabolic Biomarkers',
        description: 'Supports improvements in circulating triglycerides, visceral fat volume, and vascular endothelial function.',
        iconType: 'heart'
      }
    ];
  }

  // 6. CJC-1295 / Ipamorelin / GHRP / Tesamorelin (Growth Hormone Secretagogues)
  if (
    slug.includes('cjc') ||
    slug.includes('ipamorelin') ||
    slug.includes('ghrp') ||
    slug.includes('tesamorelin') ||
    category.includes('growth hormone')
  ) {
    return [
      {
        title: 'Pulsatile GH Release Kinetics',
        description: 'Activates pituitary somatotroph GHRH and GHS-R1a pathways to stimulate natural pulsatile growth hormone secretion.',
        iconType: 'zap'
      },
      {
        title: 'Hepatic IGF-1 Upregulation',
        description: 'Stimulates stable downstream insulin-like growth factor-1 (IGF-1) transcription and systemic circulation.',
        iconType: 'activity'
      },
      {
        title: 'Myofibrillar Protein Synthesis',
        description: 'Promotes mTOR phosphorylation, cellular amino acid uptake, and muscle protein turnover signaling.',
        iconType: 'dna'
      },
      {
        title: 'Metabolic & Adipose Mobilization',
        description: 'Favors non-esterified fatty acid oxidation while maintaining healthy baseline cortisol and prolactin profiles.',
        iconType: 'scale'
      }
    ];
  }

  // 7. Epithalon / Longevity / Epigenetics
  if (slug.includes('epithalon') || slug.includes('epitalon') || category.includes('longevity')) {
    return [
      {
        title: 'Telomerase (TERT) Upregulation',
        description: 'Stimulates catalytic telomerase reverse transcriptase expression to maintain telomeric repeat length.',
        iconType: 'dna'
      },
      {
        title: 'Pineal & Circadian Homeostasis',
        description: 'Biomimetic regulation of melatonin rhythmicity and neuroendocrine hypothalamic-pituitary-pineal axis balance.',
        iconType: 'clock'
      },
      {
        title: 'Chromatin & Epigenetic Stability',
        description: 'Modulates heterochromatin decondensation and ribosomal DNA transcription in senescent cell lines.',
        iconType: 'shield'
      },
      {
        title: 'Oxidative Stress Resistance',
        description: 'Boosts endogenous antioxidant enzyme expression (superoxide dismutase, glutathione peroxidase).',
        iconType: 'heart'
      }
    ];
  }

  // 8. MOTS-c / Mitochondrial Peptides
  if (slug.includes('mots-c') || name.includes('mots-c')) {
    return [
      {
        title: 'Mitochondrial-Nuclear Communication',
        description: 'Small mitochondrial-derived peptide that translocates to the nucleus under metabolic stress to regulate transcription.',
        iconType: 'dna'
      },
      {
        title: 'AMPK Pathway Activation',
        description: 'Directly stimulates AMP-activated protein kinase (AMPK) phosphorylation to restore cellular energy homeostasis.',
        iconType: 'zap'
      },
      {
        title: 'Glucose & GLUT4 Translocation',
        description: 'Enhances skeletal muscle glucose uptake and insulin-independent carbohydrate utilization in metabolic models.',
        iconType: 'scale'
      },
      {
        title: 'Exercise-Mimetic Performance',
        description: 'Increases fatty acid beta-oxidation, cellular endurance capacity, and metabolic flexibility under nutrient challenge.',
        iconType: 'flame'
      }
    ];
  }

  // 9. GHK-Cu (Copper Tripeptide)
  if (slug.includes('ghk') || name.includes('ghk')) {
    return [
      {
        title: 'Collagen & Elastin Biosynthesis',
        description: 'Stimulates pro-collagen I, III, and tropoelastin synthesis by dermal and deep tissue fibroblasts.',
        iconType: 'dna'
      },
      {
        title: 'Copper(II) Redox Transport',
        description: 'High-affinity Chelation and delivery of catalytic Cu2+ ions to key extracellular matrix remodeling enzymes.',
        iconType: 'activity'
      },
      {
        title: 'Tissue Remodeling & MMP Regulation',
        description: 'Balances matrix metalloproteinases (MMPs) and their inhibitors (TIMPs) for scar-free matrix turnover.',
        iconType: 'shield'
      },
      {
        title: 'Anti-Inflammatory Gene Expression',
        description: 'Downregulates pro-inflammatory cytokines (TGF-beta, TNF-alpha) and suppresses oxidative tissue damage.',
        iconType: 'flame'
      }
    ];
  }

  // 10. Default General Peptide Research Areas
  return [
    {
      title: 'Targeted Receptor Kinetics',
      description: 'Evaluates high-affinity binding to cognate GPCR / tyrosine kinase complexes with calibrated concentration-response metrics.',
      iconType: 'activity'
    },
    {
      title: 'Signal Transduction Cascades',
      description: 'Maps downstream second messenger activation, protein phosphorylation, and cellular gene expression pathways.',
      iconType: 'zap'
    },
    {
      title: 'Metabolic & Cellular Balance',
      description: 'Investigates cellular energy homeostasis, mitochondrial respiration, and molecular clearance in biological media.',
      iconType: 'scale'
    },
    {
      title: 'High-Purity Assay Standard',
      description: 'Standardized lyophilized reference formulation with verified HPLC purity (>99.0%) for reproducible analytical testing.',
      iconType: 'shield'
    }
  ];
}
