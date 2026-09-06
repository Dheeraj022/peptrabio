const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, Header
} = require('docx');
const fs = require('fs');

const cb  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bds = { top: cb, bottom: cb, left: cb, right: cb };

function hdrRow(c1, c2) {
  const mk = (t, w) => new TableCell({
    borders: bds, width: { size: w, type: WidthType.DXA },
    shading: { fill: "2D6A4F", type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 160, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, font: "Arial", color: "FFFFFF" })] })]
  });
  return new TableRow({ children: [mk(c1, 3600), mk(c2, 5760)] });
}

function specRow(label, value, shade) {
  const bg = shade ? "EAF4EE" : "FFFFFF";
  const mkc = (t, w, accent) => new TableCell({
    borders: bds, width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 160, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: accent, size: 20, font: "Arial", color: accent ? "2D6A4F" : "333333" })] })]
  });
  return new TableRow({ children: [mkc(label, 3600, true), mkc(value, 5760, false)] });
}

const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 380, after: 120 },
  children: [new TextRun({ text: t, bold: true, size: 32, font: "Arial", color: "2D6A4F" })]
});
const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 100 },
  children: [new TextRun({ text: t, bold: true, size: 26, font: "Arial", color: "2563A8" })]
});
const h3 = t => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 },
  children: [new TextRun({ text: t, bold: true, size: 22, font: "Arial", color: "444444" })]
});
const para = (t, c) => new Paragraph({
  spacing: { before: 60, after: 120, line: 280 },
  children: [new TextRun({ text: t, size: 22, font: "Arial", color: c || "4A5568" })]
});
const bullet = t => new Paragraph({
  numbering: { reference: "bullets", level: 0 }, spacing: { before: 40, after: 40 },
  children: [new TextRun({ text: t, size: 22, font: "Arial", color: "4A5568" })]
});
const gap = () => new Paragraph({ spacing: { before: 60, after: 60 }, children: [] });

function specTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [3600, 5760],
    rows: [hdrRow("Property", "Value"), ...rows]
  });
}

const doc = new Document({
  numbering: {
    config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
      alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial" }, paragraph: { spacing: { before: 380, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 260, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: {
      default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2D6A4F", space: 1 } },
        spacing: { before: 0, after: 160 },
        children: [
          new TextRun({ text: "Selank  —  5mg  |  Synthetic Tuftsin Analog  |  Research Grade", bold: true, size: 20, font: "Arial", color: "2D6A4F" }),
          new TextRun({ text: "    |    Research Use Only", size: 18, font: "Arial", color: "999999" })
        ]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 1 } },
        spacing: { before: 120 }, alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "PeptideLab  |  In Vitro Research Only  |  Page ", size: 18, font: "Arial", color: "999999" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "999999" })
        ]
      })] })
    },
    children: [
      // TITLE
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Selank", bold: true, size: 64, font: "Arial", color: "2D6A4F" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Synthetic Tuftsin Analog  |  5mg  |  Research Grade", size: 26, font: "Arial", color: "555555" })] }),
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [
        new TextRun({ text: "99%+ Purity", bold: true, size: 20, font: "Arial", color: "2D6A4F" }),
        new TextRun({ text: "  |  ", size: 20, font: "Arial", color: "AAAAAA" }),
        new TextRun({ text: "USA Manufactured", bold: true, size: 20, font: "Arial", color: "2563A8" }),
        new TextRun({ text: "  |  ", size: 20, font: "Arial", color: "AAAAAA" }),
        new TextRun({ text: "GABAergic & Serotonergic", bold: true, size: 20, font: "Arial", color: "7B4F9E" }),
        new TextRun({ text: "  |  ", size: 20, font: "Arial", color: "AAAAAA" }),
        new TextRun({ text: "Lyophilized Powder", bold: true, size: 20, font: "Arial", color: "B07828" }),
      ] }),
      new Paragraph({
        spacing: { before: 80, after: 320 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E7F0", space: 1 } },
        children: [new TextRun({ text: "\u26A0\uFE0F  For In Vitro Laboratory Research Only — Not for Human or Veterinary Use", bold: true, size: 20, font: "Arial", color: "C0392B" })]
      }),

      h1("What Is Selank?"),
      para("Selank is a synthetic seven-amino acid peptide derived from tuftsin, a naturally occurring tetrapeptide (Thr-Lys-Pro-Arg) that is cleaved from the Fc fragment of immunoglobulin G and plays a role in immune modulation. Rather than simply replicating tuftsin's sequence, Selank extends it with a C-terminal Pro-Gly-Pro tail, which substantially improves metabolic stability and extends the molecule's half-life compared to the parent compound. An N-terminal acetyl group is also present in some formulations to further resist enzymatic attack from the N-terminal end."),
      para("The full sequence — Thr-Lys-Pro-Arg-Pro-Gly-Pro — contains three proline residues that introduce structural rigidity and significantly slow degradation by common peptidases. This design makes Selank more resistant to breakdown than tuftsin while preserving the immunomodulatory core of the parent molecule. At the same time, Selank has shown biological activity in multiple neurological research contexts — particularly in models of anxiety, stress, and cognitive function — that go well beyond what tuftsin itself produces."),
      para("Selank was developed in Russia at the Institute of Molecular Genetics, where it was investigated primarily as an anxiolytic research compound. Its pharmacological profile in preclinical studies is notable for producing anxiolytic-like effects without sedation, motor impairment, or the tolerance and dependence patterns associated with benzodiazepines. This distinguishes it mechanistically from classical GABAergic anxiolytics and makes it a useful tool for studying non-benzodiazepine anxiolytic pathways."),
      para("In laboratory settings, Selank is used to study GABAergic and monoaminergic neurotransmitter system interactions, stress-induced behavioural changes, BDNF-mediated cognitive pathways, immune-brain axis communication, and cytokine modulation in stress and neuroinflammation models."),

      h1("Peptide Specifications"),
      specTable([
        specRow("Peptide Name", "Selank", false),
        specRow("Synonyms", "Selanc, TP-7, Thr-Lys-Pro-Arg-Pro-Gly-Pro, 129954-34-3", true),
        specRow("CAS Number", "129954-34-3", false),
        specRow("Molecular Formula", "C\u2083\u2083H\u2085\u2087N\u2081\u2081O\u2089", true),
        specRow("Molecular Weight", "751.87 Da (751.9 g/mol)", false),
        specRow("Monoisotopic Mass", "751.434 Da", true),
        specRow("PubChem CID", "11765600", false),
        specRow("Peptide Length", "7 amino acids (heptapeptide)", true),
        specRow("Full Sequence", "Thr-Lys-Pro-Arg-Pro-Gly-Pro (TKPRPGP)", false),
        specRow("Parent Compound", "Tuftsin (Thr-Lys-Pro-Arg) — immunomodulatory tetrapeptide", true),
        specRow("C-Terminal Extension", "Pro-Gly-Pro (stability-enhancing addition)", false),
        specRow("Proline Content", "3 of 7 residues are proline (positions 3, 5, 7)", true),
        specRow("Net Charge (pH 7.4)", "+2 (from Lys and Arg residues)", false),
        specRow("Primary Mechanisms", "GABAergic modulation, serotonin/enkephalin system, BDNF upregulation", true),
        specRow("Immunomodulatory Origin", "Derived from tuftsin (IgG Fc fragment peptide)", false),
        specRow("Appearance", "White to off-white lyophilized powder", true),
        specRow("Solubility", "Water, bacteriostatic water, PBS", false),
        specRow("Purity", "\u226599% by RP-HPLC", true),
        specRow("Vial Size", "5mg", false),
        specRow("Shelf Life", "12+ months at \u221220\u00b0C sealed", true),
      ]),
      gap(),

      h1("Structural Features"),
      h3("The Tuftsin Core"),
      para("The first four residues of Selank — Thr-Lys-Pro-Arg — are identical to tuftsin, an endogenous peptide recognised for its ability to stimulate phagocytic immune cells and modulate immune responses. In tuftsin, this core sequence is responsible for binding to specific receptors on macrophages and neutrophils, promoting their activity. Selank retains this immunomodulatory capability while adding stability that the fragile tuftsin molecule lacks."),
      h3("The Pro-Gly-Pro Tail"),
      para("The C-terminal Pro-Gly-Pro extension is what structurally distinguishes Selank from tuftsin. Proline at positions 5 and 7 flanking a central glycine creates a semi-rigid tail that resists carboxypeptidase attack. This extension was designed specifically to extend the metabolic half-life of the parent tuftsin sequence, and it succeeds: Selank's plasma half-life of approximately 20\u201330 minutes represents a substantial improvement over tuftsin, which is degraded within minutes. Beyond stability, the Pro-Gly-Pro tail also appears to contribute to the peptide's neurological activity, as some fragments of Selank retain biological effects."),
      h3("Three Prolines and Conformational Stability"),
      para("Prolines at positions 3, 5, and 7 give Selank an unusually rigid backbone for a seven-residue peptide. Proline's cyclic structure restricts rotation around its nitrogen bond, introducing structural constraints that protect adjacent peptide bonds from protease attack. This makes Selank significantly more stable than most linear heptapeptides of comparable size."),
      h3("Basic Residues and Surface Interactions"),
      para("Lysine at position 2 and arginine at position 4 give the peptide a net positive charge of +2 at physiological pH. This charge character facilitates electrostatic interactions with negatively charged cell membrane components, which may contribute to cellular uptake and membrane proximity during receptor engagement. The positively charged residues also make Selank somewhat soluble in aqueous buffers at physiological pH, though low-binding containers are still advisable at low concentrations."),

      h1("Mechanism of Action"),
      h2("GABAergic System Modulation"),
      para("One of Selank's defining pharmacological features is its ability to produce anxiolytic-like effects through GABAergic pathways without acting as a direct GABA receptor agonist. This is mechanistically distinct from benzodiazepines, which bind to allosteric sites on GABA-A receptors and amplify chloride channel conductance. Selank appears to modulate GABAergic transmission indirectly — through effects on GABAergic interneuron activity, receptor expression changes, and interactions with the opioid-GABAergic interface — producing reduced anxiety-like behaviour in animal models without the sedation, motor impairment, or tolerance development typical of direct GABA-A agonists."),
      h2("Enkephalin System and Opioid Tone"),
      para("Selank inhibits enkephalinase, the enzyme responsible for degrading endogenous enkephalins in the synapse. By slowing enkephalin breakdown, Selank effectively raises the local concentration of these endogenous opioid peptides, augmenting tonic opioid signalling without introducing exogenous opioids. Enkephalins act on mu and delta opioid receptors and contribute to pain modulation, mood regulation, and stress resilience. This enkephalinase inhibition is thought to be one of the primary mechanisms underlying Selank's anxiolytic and stress-protective effects in rodent models."),
      h2("Serotonin System Effects"),
      para("Selank modulates serotonin (5-HT) turnover in brain regions affected by chronic stress and anxiety. In midbrain structures, it restores serotonin and serotonin metabolite levels that are disrupted by immobilisation stress or chronic unpredictable stress protocols. The mechanism may involve indirect effects on serotonin synthesis or reuptake through its actions on the enkephalin system, since enkephalins and serotonin signalling are interconnected in limbic and midbrain circuits that regulate emotional state and stress adaptation."),
      h2("BDNF Upregulation"),
      para("Selank increases BDNF protein levels in the hippocampus and prefrontal cortex in preclinical models. BDNF is a key mediator of synaptic plasticity, long-term potentiation, and neuronal survival. In the context of Selank research, BDNF upregulation in the hippocampus has been linked to improvements in learning and memory tasks, particularly following ethanol-induced cognitive impairment or chronic stress. Kolik et al. (2019) specifically demonstrated that Selank's protection against ethanol-induced memory impairment correlated with maintained BDNF levels in the hippocampus and prefrontal cortex."),
      h2("Immunomodulatory Actions"),
      para("Reflecting its tuftsin origins, Selank retains immunomodulatory activity. In stress models involving acute traumatic or social stress, Selank normalises the IL-6/IL-10 cytokine balance — reducing pro-inflammatory IL-6 while supporting the anti-inflammatory IL-10 response. It also modulates gene expression related to chemokines, cytokine receptors, and immune cell trafficking. Research by Kolomin et al. (2023) showed significant changes in chemokine and cytokine receptor gene expression under Selank treatment, supporting its role as a broad immune-gene modulator rather than a simple anti-inflammatory."),

      h1("Research Applications"),
      h2("1. Anxiolytic Mechanism Research"),
      para("Selank is studied in the elevated plus-maze, open-field test, and social interaction test as a model anxiolytic compound. At doses of 100\u2013300 \u00b5g/kg (intraperitoneal), it consistently reduces anxiety-like behaviours without decreasing locomotor activity or producing signs of sedation in rodent models. This sedation-free profile makes it a clean tool for studying anxiolytic mechanisms that don't involve direct GABA-A receptor agonism. Comparative experiments pairing Selank with benzodiazepines, SSRI-class compounds, or GABA receptor antagonists allow researchers to map the specific pathways responsible for its anxiolytic effects."),
      h2("2. Stress Physiology and HPA Axis Research"),
      para("Selank has been shown to reduce physiological markers of chronic stress in animal models including adrenal hypertrophy, corticosterone elevation, and morphological changes in the colon and liver. Mukhina et al. (2020) demonstrated that Selank treatment reduced chronic restraint stress-induced colonic structural changes, suggesting it attenuates organ-level consequences of sustained HPA axis activation. In immune-focused stress research, Selank restores phagocytic neutrophil activity and cellular immune function suppressed by acute traumatic stress, positioning it as a tool for studying stress-immune interaction mechanisms."),
      h2("3. Cognitive Function Research"),
      para("In passive avoidance and Morris water maze paradigms, Selank improves acquisition and retention in both normal and cognitively challenged rodent populations. The most mechanistically informative studies involve cognitive challenge models — particularly ethanol-induced impairment, where Selank's protection of BDNF levels in the hippocampus and prefrontal cortex provides a clear neurotrophic correlate for the observed behavioural improvements. Research protocols in this area typically include BDNF protein measurement alongside behavioural endpoints to establish the mechanistic link."),
      h2("4. Immune System and Neuroimmune Research"),
      para("Selank's tuftsin-derived core makes it particularly relevant for studying the interface between the immune system and the central nervous system. Research applications include: cytokine profile modulation in acute stress models; T-cell and B-cell activity changes in stressed versus unstressed animals; macrophage and neutrophil functional changes; and gene expression profiling of chemokine and cytokine networks under Selank treatment. Kolomin et al. (2023) identified widespread changes in chemokine and cytokine receptor gene expression that suggest Selank operates at a transcriptional level in immune regulation."),
      h2("5. Neuroprotection and Neuroinflammation"),
      para("In glial cell culture models, Selank affects cytokine release and promotes neuroprotective signalling. In neuroinflammation paradigms, it reduces microglial activation markers and pro-inflammatory cytokine output. The combination of BDNF upregulation, reduced neuroinflammatory tone, and enkephalin system augmentation gives Selank a multi-pathway neuroprotective profile relevant to models of stress-induced neuronal damage, excitotoxicity, and oxidative injury."),

      h1("Storage and Reconstitution"),
      h2("Lyophilized Powder"),
      bullet("Store at \u221220\u00b0C to \u221280\u00b0C in the original sealed vial"),
      bullet("Protect from light and moisture; desiccated environment required"),
      bullet("Stable for 12+ months at \u221220\u00b0C under proper conditions"),
      bullet("Avoid temperature cycling of sealed vials"),

      h2("Reconstitution"),
      bullet("Use sterile water, bacteriostatic water (0.9% benzyl alcohol), or PBS"),
      bullet("Target final pH 6.0\u20137.5 for optimal stability"),
      bullet("Add solvent slowly down the inner wall of the vial; swirl gently for 1\u20132 minutes"),
      bullet("Do not shake or vortex; solution should appear clear and colourless"),
      bullet("Wipe vial stopper with 70% alcohol before each use"),

      h2("After Reconstitution"),
      bullet("Store at 4\u00b0C for up to 7 days"),
      bullet("Freeze at \u221220\u00b0C in single-use aliquots for longer storage"),
      bullet("Maximum 2\u20133 freeze-thaw cycles; discard if solution becomes cloudy or changes colour"),
      bullet("Intranasal route shows higher CNS bioavailability in some rodent models \u2014 consider route selection based on research question"),
      gap(),

      h1("Quality Assurance"),
      specTable([
        specRow("Purity (HPLC)", "\u226599% \u2014 RP-HPLC, UV at 214nm", false),
        specRow("Mass Verification", "ESI-MS confirming 751.87 Da", true),
        specRow("Sequence Composition", "7-residue composition verified by amino acid analysis", false),
        specRow("Endotoxin", "<5 EU/mg (LAL method)", true),
        specRow("Water Content", "<8% (Karl Fischer titration)", false),
        specRow("Residual Solvents", "TFA and acetonitrile within ICH guidelines", true),
        specRow("COA", "Provided with every batch; available pre-purchase", false),
      ]),
      gap(),

      h1("Scientific References"),
      para("Vyunova, T. et al. (2018). Peptide-based anxiolytics: the molecular aspects of heptapeptide Selank biological activity. Protein and Peptide Letters, 25(10), 914\u2013923. https://doi.org/10.2174/0929866525666180925144642"),
      para("Kolik, L. et al. (2019). Selank, peptide analogue of tuftsin, protects against ethanol-induced memory impairment by regulating BDNF content in the hippocampus and prefrontal cortex in rats. Bulletin of Experimental Biology and Medicine, 167, 641\u2013644. https://doi.org/10.1007/s10517-019-04588-9"),
      para("Kolomin, T. et al. (2023). Changes in expression of chemokines, cytokines and their receptors under the action of Selank and its fragments. Journal of Clinical Physiology and Pathology. https://doi.org/10.59315/jiscpp.2023-2-2.16-18"),
      para("Mukhina, A. et al. (2020). Morphological changes in the large intestine of rats subjected to chronic restraint stress and treated with Selank. Bulletin of Experimental Biology and Medicine, 169, 281\u2013285. https://doi.org/10.1007/s10517-020-04868-9"),
      para("Ashmarin, I.P. et al. (2005). Design and study of a novel immunomodulatory peptide, Selank. Russian Journal of Bioorganic Chemistry."),
      para("Kozlovskaya, M.M. et al. (2000). The anxiolytic effect of Selank on experimental models of anxiety. Neuroscience and Behavioral Physiology."),
      gap(),

      h1("Research Use Disclaimer"),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        border: {
          top:    { style: BorderStyle.SINGLE, size: 4,  color: "C0392B", space: 4 },
          bottom: { style: BorderStyle.SINGLE, size: 4,  color: "C0392B", space: 4 },
          left:   { style: BorderStyle.SINGLE, size: 18, color: "C0392B", space: 4 },
          right:  { style: BorderStyle.SINGLE, size: 4,  color: "C0392B", space: 4 },
        },
        children: [new TextRun({ size: 20, font: "Arial", color: "C0392B",
          text: "This product is supplied exclusively for in vitro laboratory research and approved preclinical animal studies. It has not been approved by the FDA, EMA, or any regulatory authority for therapeutic, diagnostic, or nutritional use in humans or animals. Bodily introduction into humans or animals outside of a formally approved institutional research framework is strictly prohibited. This product must only be handled by licensed, qualified research professionals in an appropriate setting with proper institutional oversight. No information on this page constitutes medical advice, therapeutic guidance, or clinical recommendation of any kind."
        })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/selank-5mg.docx', buf);
  console.log('Selank DOCX written');
}).catch(e => console.error('Error:', e));
