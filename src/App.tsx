import React, { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Signature, 
  CheckCircle, 
  Settings, 
  AlertTriangle, 
  ArrowRight, 
  Database, 
  Layers, 
  Server, 
  Globe, 
  FileCheck, 
  Copy, 
  Download, 
  Plus, 
  Building2, 
  MapPin, 
  DollarSign, 
  Mail, 
  User, 
  Flame, 
  HelpCircle,
  ExternalLink,
  Info,
  Smartphone,
  Send,
  Check,
  RefreshCw,
  Sliders,
  Eye,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Predefined fallback clauses for specific project types in civil engineering
const DEFAULT_CIVIL_CLAUSES = {
  Residential: `### RESIDENTIAL CIVIL & STRUCTURAL SPECIFICATION (AS2870 CODES)

1. **Geotechnical Classification & Soil Testing:**
   - Standard footing design assumes general Class H1 / H2 reactive soil conditions unless site soil testing specifies Class P or E reactive classifications.
   - Soil investigation on-site will be undertaken to confirm reactivity levels prior to slab preparation.

2. **Foundation & Concrete Slab Engineering:**
   - Concrete slab-on-ground structural framework details to be specified in compliance with standard AS2870 (Residential Slabs and Footings Code).
   - Steel reinforcement specification: SL82 grid mesh with typical 3-N12 trench mesh configured for standard load paths.

3. **Superstructure & Framing Inspections:**
   - Dynamic timber framing analysis based on AS1684 (Residential Timber-Framed Construction) to support uniform dead and live loads.
   - Certification of lintel, structural steel beam spans, and wind bracing layouts up to Rating wind region N3.`,
   
  Commercial: `### COMMERCIAL CIVIL & STRUCTURAL SPECIFICATION (AS1170 CODES)

1. **Foundations, Slabs & Heavy Piling Layout:**
   - Slab design configured to resist persistent heavy concentrated warehouse wheel loads and localized equipment vibration forces.
   - Piling specifications to reach guaranteed load-bearing siltstone or sandstone bedrock (minimum embedment depth 1.5 meters).

2. **Steel Portal Frame & Tilt-Up Panel Systems:**
   - Structural design of hot-rolled steel universal beams (UB) & Columns (UC) conforming with the AS4100 steel structures code.
   - Pre-cast concrete tilt-up wall panels detailing transport rigging layout, temporary wind bracing props, and joint connection detail design.

3. **Retaining Wall Structures & Carpark Compliance:**
   - Cantilevered reinforced concrete masonry block retaining frames up to 3.0 meters height including robust soil sub-surface geofabric drainage.
   - Asphaltic/concrete pavement design for heavy vehicle (HV) turning paths conforming to local planning regulations.`,
   
  Subdivision: `### CIVIL SUBDIVISION & INFRASTRUCTURE SPECIFICATION

1. **Stormwater Drainage & Hydrology Management (SMP):**
   - Detention pond and WSUD (Water Sensitive Urban Design) bioretention basin design targeting 100-year ARI (Average Recurrence Interval) flood safety intervals.
   - Comprehensive drainage pipe networks matching hydraulic gradients to support gravity runoff discharges.

2. **Bulk Earthworks & Site Grading:**
   - Optimization of localized cut-and-fill balances across multiple lots to minimize expensive off-site material export/import costs.
   - Longitudinal profiling specifications for newly designed public access roads and concrete footpaths.

3. **Water, Sewer & Utilities Reticulation:**
   - Layout planning of extension water mains, sewer gravity pipelines, and electrical conduits.
   - Secure coordination of direct easements in accordance with water utilities guidelines and regional development parameters.`
};

export default function App() {
  // Input fields state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [projectType, setProjectType] = useState("Residential");
  const [fee, setFee] = useState("4500");
  const [scopeDetails, setScopeDetails] = useState("");

  // System and generator states
  const [loading, setLoading] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState<"sandbox" | "playbook">("sandbox");
  
  // Signature pad states
  const [hasSigned, setHasSigned] = useState(false);
  const [canvasUrl, setCanvasUrl] = useState<string | null>(null);
  const [signProgress, setSignProgress] = useState<"pending" | "signed">("pending");
  const [signerName, setSignerName] = useState("");
  const [signerDate, setSignerDate] = useState("");

  // Interactive options for DocuSeal, mobile perspective, and verification
  const [signingEngine, setSigningEngine] = useState<"portal" | "docuseal">("portal");
  const [viewportPerspective, setViewportPerspective] = useState<"workspace" | "mobile">("workspace");
  const [docusealStatus, setDocusealStatus] = useState<"idle" | "preparing" | "sent" | "signing_completed">("idle");
  const [docusealTemplateId, setDocusealTemplateId] = useState("ce_residential_v2_as2870");
  const [docusealFieldMapping, setDocusealFieldMapping] = useState({
    clientNamePlaceholder: "{client_name}",
    addressPlaceholder: "{project_address}",
    feePlaceholder: "{fee_aud}"
  });
  const [smsVerification, setSmsVerification] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  
  // Archival system state
  const [contractsArchive, setContractsArchive] = useState<any[]>(() => {
    const saved = localStorage.getItem("concept_engineers_proposals");
    return saved ? JSON.parse(saved) : [
      {
        id: "PROP-9283-A",
        clientName: "David Henderson (Metro Homes)",
        projectType: "Residential",
        projectAddress: "42 Broadview Terrace, Brisbane QLD",
        fee: "3200",
        date: "2026-06-05",
        status: "Signed",
        signatureUrl: "demo",
        auditHash: "SHA256: 8a7f4e92...f7b3"
      },
      {
        id: "PROP-8120-C",
        clientName: "Lachlan Logistics Ltd",
        projectType: "Commercial",
        projectAddress: "Unit 4/12 Industry Parkway, Sydney NSW",
        fee: "18500",
        date: "2026-06-08",
        status: "Pending Signature",
        signatureUrl: null,
        auditHash: null
      }
    ];
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Save changes to local storage
  useEffect(() => {
    localStorage.setItem("concept_engineers_proposals", JSON.stringify(contractsArchive));
  }, [contractsArchive]);

  // Set default signer details when generated
  useEffect(() => {
    if (clientName) {
      setSignerName(clientName);
    }
  }, [clientName]);

  useEffect(() => {
    setSignerDate(new Date().toLocaleDateString("en-AU"));
  }, []);

  // Synchronise DocuSeal template ID with project type
  useEffect(() => {
    if (projectType === "Residential") {
      setDocusealTemplateId("tmpl_ce_res_as2870");
    } else if (projectType === "Commercial") {
      setDocusealTemplateId("tmpl_ce_com_as1170");
    } else if (projectType === "Subdivision") {
      setDocusealTemplateId("tmpl_ce_sub_wsud");
    } else {
      setDocusealTemplateId("tmpl_ce_custom_as3600");
    }
  }, [projectType]);

  // Request proposal generation from our Express proxy + Gemini Model
  const handleGenerateProposal = async () => {
    if (!clientName || !projectAddress || !fee) {
      alert("Please fill in the Client Name, Address, and Fee to proceed.");
      return;
    }

    setLoading(true);
    setGeneratedProposal(null);
    setHasSigned(false);
    setCanvasUrl(null);
    setSignProgress("pending");

    try {
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          projectType,
          projectAddress,
          fee,
          scopeDetails
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedProposal(data.proposalText);
      } else {
        // Fallback generator if API key is not supplied or server offline
        console.warn("Backend error or API Key missing. Rendering localized dynamic fallback.");
        setTimeout(() => {
          const fallbackText = generateFallbackProposalLocal();
          setGeneratedProposal(fallbackText);
        }, 1200);
      }
    } catch (err) {
      console.error("Fetch Exception. Generating client-side dynamic fallback:", err);
      const fallbackText = generateFallbackProposalLocal();
      setGeneratedProposal(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackProposalLocal = () => {
    const selectedClauses = DEFAULT_CIVIL_CLAUSES[projectType as keyof typeof DEFAULT_CIVIL_CLAUSES] || "";
    const cleanFee = parseFloat(fee).toLocaleString("en-AU");
    const gstValue = (parseFloat(fee) * 0.1).toFixed(2);
    const totalFee = (parseFloat(fee) * 1.1).toFixed(2);

    return `# SERVICES AGREEMENT & CIVIL ENGINEERING PROPOSAL

**DATE:** ${new Date().toLocaleDateString("en-AU")}
**PROPOSAL NUMBER:** CE-${Math.floor(100000 + Math.random() * 900000)}
**PREPARED BY:** Principal Engineer, Concept Engineers Pty Ltd (ABN 50 120 482 119)
**PREPARED FOR:** ${clientName}

---

### 10 PENETRATING PROJECT OVERVIEW
This professional agreement sets out the Terms of Reference, Standard Performance Parameters, and engineering schedules regarding the structural and civil engineering scope required at the project location under professional standards.

* **Client Name:** ${clientName}
* **Proposed Site Location:** ${projectAddress}
* **Work Engagement Scope:** Professional design and validation for "${projectType}" civil & structural construction parameters.

---

### 20 TECHNICAL SCOPE OF ENGAGEMENT
The engagement entails the delivery of reliable engineering computations, specific architectural framework assessments, and certified engineering documentation required for subsequent local regulatory development applications (DA).

${selectedClauses}

### 30 ADDITIONAL SPECIALIST CONDITIONS:
${scopeDetails || "Standard scope requirements apply. No custom site constraints or heritage conditions recorded."}

---

### 40 FEES & BILLING SCHEDULE
Professional fees are fixed based on information made available at the signing date. If severe geological or site variance forces significant re-engineering, adjustments will be made by mutual written confirmation.

* **Professional Services Fixed Fee (ex GST):** $${cleanFee} AUD
* **Required GST Contribution (10%):** $${parseFloat(gstValue).toLocaleString("en-AU")} AUD
* **Sum Total Invoiced Fee:** $${parseFloat(totalFee).toLocaleString("en-AU")} AUD

#### Milestone Payment Framework:
1. **Milestone 1 (Pre-commencement Deposit):** 30% representing preliminary investigation expenses.
2. **Milestone 2 (Draft Review Delivery):** 50% upon delivery of preliminary draft engineering drawings.
3. **Milestone 3 (Final Certified Signing):** 20% prior to official Form 15 construction release signature.

---

### 50 CONTRACTUAL LIMITS & PROFESSIONAL INDEMNITY
- The total aggregated fiscal liability of Concept Engineers is limited explicitly to the value of the Professional Services Fixed Fee payable herein.
- Standard professional indemnity insurance is kept active and certified.
- Soil movement and weather-driven foundation settling following handover are not covered under ordinary structural design warranties.

---

### CLIENT DECLARATION & FORMAL AUTHORISATION
By signing below, the Client represents legal authorization and requests Concept Engineers Pty Ltd to proceed with the specified services set out in this document.

*Client Authorized Name: ${clientName}*
*Signing Location: via Concept Engineers E-sign System (sign.conceptengineers.com.au)*
`;
  };

  // Copy proposal text to clipboard
  const handleCopyText = () => {
    if (!generatedProposal) return;
    navigator.clipboard.writeText(generatedProposal);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Canvas Drawing Logic for Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) {
      if (e.cancelable) e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.strokeStyle = "#F27D26"; // Vibrant brand accent color for digital ink
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    const coords = getEventCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) {
      if (e.cancelable) e.preventDefault();
    }
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setCanvasUrl(null);
  };

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Finish signing simulation
  const handleSealSignature = () => {
    if (!hasSigned) {
      alert("Please draw your signature onto the signature block first.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setCanvasUrl(dataUrl);
    setSignProgress("signed");

    // Add to localized storage contracts ledger
    const newContract = {
      id: "PROP-" + Math.floor(10000 + Math.random() * 90000),
      clientName: signerName || clientName || "Anonymous",
      projectType,
      projectAddress: projectAddress || "Address standard check",
      fee: fee || "3500",
      date: new Date().toLocaleDateString("en-AU"),
      status: "Signed",
      signatureUrl: dataUrl,
      auditHash: "SHA256: " + Math.random().toString(16).substring(2, 10).toUpperCase() + "..." + Math.random().toString(16).substring(2, 6).toUpperCase()
    };

    setContractsArchive([newContract, ...contractsArchive]);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] font-sans text-[#E0E0E0] flex flex-col" id="proposal-hub">
      {/* Dynamic Top Navigation Bar */}
      <nav className="h-16 border-b border-[#2A2D35] bg-[#0F1115] px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F27D26] rounded-sm flex items-center justify-center shadow-md">
            <span className="text-black font-extrabold text-lg font-display">C</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-display">
            Concept<span className="text-[#F27D26]">Engineers</span>
          </span>
          <span className="ml-4 px-2 py-0.5 rounded border border-[#3D414D] text-[10px] text-[#A0A0A0] uppercase tracking-widest hidden sm:inline-block">
            Portal
          </span>
        </div>

        {/* Tab & Mode Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex space-x-1 rounded-lg bg-[#1A1D23] border border-[#2A2D35] p-1">
            <button
              onClick={() => setActiveTab("sandbox")}
              id="tab-sandbox"
              className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "sandbox"
                  ? "bg-[#F27D26] text-black shadow-lg shadow-orange-950/20"
                  : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generator & E-Sign</span>
            </button>
            <button
              onClick={() => setActiveTab("playbook")}
              id="tab-playbook"
              className={`flex items-center space-x-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "playbook"
                  ? "bg-[#F27D26] text-black shadow-lg shadow-orange-950/20"
                  : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Possibilities Playbook</span>
            </button>
          </div>

          <div className="hidden lg:flex flex-col items-end border-l border-[#2A2D35] pl-4">
            <span className="text-xs text-[#A0A0A0] font-mono">Host: sign.conceptengineers.com.au</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DocuSeal Active
            </span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === "sandbox" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
              key="sandbox-section"
            >
              {/* Goal Quick Context Banner - Dark Green Info Palette */}
              <div className="rounded-xl border border-[#1E4D3E] bg-[#142A24] p-5 flex items-start gap-4 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[#F27D26] text-sm font-bold font-mono">
                  2m
                </span>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm">
                    Under 2-Minute Direct Proposal Workflow
                  </h3>
                  <p className="mt-1 text-xs text-[#A0A0A0] leading-relaxed">
                    Select project specifications, review automatically compiled AS (Australian Standards) clauses with **Gemini AI**, copy the signing link, or test direct client signature below inside our responsive portal mockup.
                  </p>
                </div>
              </div>

              {/* Two Column Workspace Grid */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                
                {/* Column Left: Input Form Styled with Elegant Dark Spec */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="rounded-2xl border border-[#2A2D35] bg-[#1A1D23] p-6 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#2A2D35] pb-3.5 mb-5">
                      <h4 className="font-display font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <Settings className="h-4.5 w-4.5 text-[#F27D26]" />
                        Proposal Specifications
                      </h4>
                      <span className="text-[10px] font-mono font-bold rounded bg-[#0F1115] border border-[#3D414D] px-2.5 py-0.5 text-[#A0A0A0] uppercase">
                        Internal Form
                      </span>
                    </div>

                    <div className="space-y-5">
                      {/* E-Signing Protocol Selector */}
                      <div className="p-3.5 rounded-xl bg-[#0F1115] border border-[#2A2D35]">
                        <label className="text-[10px] font-mono font-bold text-[#5C616F] uppercase tracking-wider flex items-center justify-between mb-2">
                          <span>E-Signing Protocol</span>
                          <span className="text-[#F27D26] flex items-center gap-1 font-sans text-[10px] uppercase font-bold">
                            <Sliders className="h-3 w-3" /> dispatch configuration
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSigningEngine("portal")}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                              signingEngine === "portal"
                                ? "border-[#F27D26] bg-[#21242C]/80 text-white"
                                : "border-[#2A2D35] bg-[#1A1D23] text-[#A0A0A0] hover:text-white hover:bg-[#1f2228]"
                            }`}
                          >
                            <span className="text-[11px] font-bold">Concept E-Sign Portal</span>
                            <span className="text-[8.5px] font-mono text-[#A0A0A0] mt-0.5 leading-tight">No-Login Secure Touch Signature</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigningEngine("docuseal")}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                              signingEngine === "docuseal"
                                ? "border-[#F27D26] bg-[#21242C]/80 text-white"
                                : "border-[#2A2D35] bg-[#1A1D23] text-[#A0A0A0] hover:text-white hover:bg-[#1f2228]"
                            }`}
                          >
                            <span className="text-[11px] font-bold">DocuSeal Integration Plan</span>
                            <span className="text-[8.5px] font-mono text-[#A0A0A0] mt-0.5 leading-tight">Variables Mapped via DocuSeal API</span>
                          </button>
                        </div>
                      </div>

                      {/* Client Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase flex items-center justify-between">
                          <span>Client Legal Name / Entity</span>
                          <span className="text-[#F27D26] font-mono text-[9px]">*required</span>
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C616F]">
                            <User className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. John Smith (Metro Homes)"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="block w-full rounded-lg border border-[#3D414D] bg-[#0F1115] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#5C616F] focus:outline-hidden focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all"
                          />
                        </div>
                      </div>

                      {/* Client Email Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase flex items-center justify-between">
                          <span>Client Email Address</span>
                          <span className="text-[#5C616F] font-mono text-[9px]">optional simulation</span>
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C616F]">
                            <Mail className="h-4 w-4" />
                          </div>
                          <input
                            type="email"
                            placeholder="e.g. john@metrohomes.com"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="block w-full rounded-lg border border-[#3D414D] bg-[#0F1115] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#5C616F] focus:outline-hidden focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all"
                          />
                        </div>
                      </div>

                      {/* Project Type Select Grid */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase">
                          Civil Project Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Residential", "Commercial", "Subdivision", "Other"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setProjectType(type)}
                              className={`rounded-lg border p-3 text-xs text-left font-medium transition-all ${
                                projectType === type
                                  ? "border-[#F27D26] bg-[#21242C] text-white ring-1 ring-[#F27D26]/20"
                                  : "border-[#3D414D] bg-[#0F1115] text-[#A0A0A0] hover:bg-[#1A1D23] hover:text-white"
                              }`}
                            >
                              <div className="font-bold text-white mb-0.5">{type}</div>
                              <span className="text-[9px] text-[#A0A0A0] block truncate leading-tight">
                                {type === "Residential" && "AS2870 Soil & slabs"}
                                {type === "Commercial" && "Heavy concrete piles"}
                                {type === "Subdivision" && "Stormwater hydrology"}
                                {type === "Other" && "Consultation schedules"}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Project Address Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase flex items-center justify-between">
                          <span>Project Address</span>
                          <span className="text-[#F27D26] font-mono text-[9px]">*required</span>
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C616F]">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Lot 2A, Broadwater Way, Geelong"
                            value={projectAddress}
                            onChange={(e) => setProjectAddress(e.target.value)}
                            className="block w-full rounded-lg border border-[#3D414D] bg-[#0F1115] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-[#5C616F] focus:outline-hidden focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all"
                          />
                        </div>
                      </div>

                      {/* Fee input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase">
                          Professional Fixed Fee (AUD)
                        </label>
                        <div className="relative rounded-md shadow-xs">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#5C616F]">
                            <DollarSign className="h-4 w-4" />
                          </div>
                          <input
                            type="number"
                            placeholder="e.g. 4500"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            className="block w-full rounded-lg border border-[#3D414D] bg-[#0F1115] py-2.5 pl-9 pr-14 text-sm text-white placeholder:text-[#5C616F] focus:outline-hidden focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all font-mono"
                          />
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-[10px] text-[#5C616F] font-mono font-bold uppercase">ex GST</span>
                          </div>
                        </div>
                      </div>

                      {/* Custom scope details */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#5C616F] uppercase">
                          Special Site Requirements / Site Boundary constraints <span className="text-[#5C616F] font-normal">(Optional)</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Include slope angles, easement setbacks, council parameters, or unique geotechnical variables..."
                          value={scopeDetails}
                          onChange={(e) => setScopeDetails(e.target.value)}
                          className="block w-full rounded-lg border border-[#3D414D] bg-[#0F1115] p-3 text-sm text-white placeholder:text-[#5C616F] focus:outline-hidden focus:border-[#F27D26] focus:ring-1 focus:ring-[#F27D26] transition-all resize-none"
                        />
                      </div>

                      {/* Signing protocol sub-settings */}
                      {signingEngine === "portal" ? (
                        <div className="p-3 bg-[#0F1115] rounded-xl border border-[#2A2D35] text-xs space-y-2.5">
                          <label className="font-mono text-[9px] font-bold uppercase text-[#5C616F] tracking-wider flex items-center justify-between">
                            <span>Mobile Security Verification</span>
                            <span className="text-emerald-400 font-sans text-[9px] font-bold uppercase">No login required</span>
                          </label>
                          <div className="flex items-center justify-between">
                            <span className="text-[#A0A0A0] text-[11px] font-semibold">Instant SMS Verification simulator?</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSmsVerification(!smsVerification);
                                setSmsSent(false);
                                setSmsVerified(false);
                              }}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                smsVerification ? "bg-[#F27D26]" : "bg-[#2A2D35]"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                  smsVerification ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          {smsVerification && (
                            <p className="text-[10px] text-[#A0A0A0] leading-tight italic font-mono">
                              Secures mobile screen touch-sign with a quick 4-digit verification code. Keeps user authorization absolute.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-[#0F1115] rounded-xl border border-[#2A2D35] text-xs space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-[#1f2228]">
                            <span className="font-mono text-[9.5px] font-extrabold text-[#F27D26] uppercase flex items-center gap-1">
                              <Shield className="w-3 h-3 text-[#F27D26]" />
                              DocuSeal API Configuration
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-[#142A24] border border-[#1E4D3E] px-1.5 py-0.5 rounded font-bold">API Synced</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase text-[#5C616F]">DocuSeal Template Target ID</label>
                            <input
                              type="text"
                              value={docusealTemplateId}
                              onChange={(e) => setDocusealTemplateId(e.target.value)}
                              className="w-full bg-[#1A1D23] border border-[#2A2D35] rounded-md p-1.5 text-xs text-white font-mono focus:outline-hidden focus:border-[#F27D26]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold uppercase text-[#5C616F] flex justify-between">
                              <span>Template Tag Variables Binding</span>
                              <span className="text-purple-400 text-[8.5px] lowercase font-bold">Autodetect active</span>
                            </label>
                            <div className="grid grid-cols-3 gap-1 font-mono text-[9px] bg-[#1A1D23] p-1.5 rounded border border-[#2A2D35]">
                              <div className="text-center border-r border-[#2A2D35] py-0.5">
                                <span className="block text-[#5C616F] text-[8px] uppercase">Client Name</span>
                                <span className="text-white font-bold">{docusealFieldMapping.clientNamePlaceholder}</span>
                              </div>
                              <div className="text-center border-r border-[#2A2D35] py-0.5">
                                <span className="block text-[#5C616F] text-[8px] uppercase">Address</span>
                                <span className="text-white font-bold">{docusealFieldMapping.addressPlaceholder}</span>
                              </div>
                              <div className="text-center py-0.5">
                                <span className="block text-[#5C616F] text-[8px] uppercase">Fixed Fee</span>
                                <span className="text-white font-bold">{docusealFieldMapping.feePlaceholder}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-[#2A2D35] pt-5">
                      <button
                        type="button"
                        onClick={handleGenerateProposal}
                        className={`inline-flex w-full items-center justify-center rounded-lg bg-[#F27D26] px-4 py-3 text-sm font-bold text-black shadow-lg shadow-orange-950/25 hover:bg-orange-400 focus:outline-hidden transition-all duration-150 ${
                          loading ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Compiling Australian Standards & Clauses...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Create & Send Proposal Workflow
                          </>
                        )}
                      </button>
                      <p className="mt-3 text-center text-[10px] text-[#A0A0A0] leading-normal font-mono">
                        Powered server-side by Gemini AI for regulatory Australian (AS) design compliance.
                      </p>
                    </div>
                  </div>

                  {/* Plan/Cost Estimator card */}
                  <div className="rounded-2xl border border-[#2A2D35] bg-[#1A1D23] p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-[#A0A0A0] font-bold uppercase tracking-wider">Estimated Costs</div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-[#142A24] border border-[#1E4D3E] px-2 py-0.5 rounded">
                        90% Savings
                      </span>
                    </div>
                    <div className="text-sm text-white font-semibold">Standard VPS Instance Container</div>
                    <div className="h-1.5 w-full bg-[#0F1115] rounded-full mt-3 overflow-hidden border border-[#2A2D35]">
                      <div className="w-1/4 h-full bg-[#F27D26]"></div>
                    </div>
                    <div className="text-[10px] text-[#5C616F] font-mono mt-2">
                      DigitalOcean $6/mo estimation - Infinite agreements with self-hosted DocuSeal
                    </div>
                  </div>
                </div>

                {/* Column Right: Interactive Previewer & Sign Sheet */}
                <div className="lg:col-span-7 space-y-6">
                  {!generatedProposal && !loading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2A2D35] bg-[#1A1D23] py-20 px-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0F1115] border border-[#2A2D35] text-[#F27D26] shadow-md">
                        <FileText className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 font-display font-bold text-white text-base">Unpublished Document Workspace</h3>
                      <p className="mt-1.5 max-w-sm text-xs text-[#A0A0A0] leading-relaxed">
                        Specify client names and parameters, then trigger the generator to forge your compliant contract. This allows seamless variable validation before clients sign.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Interactive Workspace Viewport Toolbar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#1A1D23] border border-[#2A2D35] rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-[#21242C] p-2 rounded-lg border border-[#F27D26]/20">
                            <Eye className="h-4.5 w-4.5 text-[#F27D26]" />
                          </div>
                          <div>
                            <span className="text-xs font-mono text-[#A0A0A0] block uppercase tracking-wider">Viewport Simulator</span>
                            <span className="text-sm font-bold text-white">Select client perspective mode</span>
                          </div>
                        </div>
                        <div className="flex space-x-1 bg-[#0F1115] border border-[#2A2D35] p-1 rounded-lg w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setViewportPerspective("workspace")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              viewportPerspective === "workspace"
                                ? "bg-[#F27D26] text-black font-extrabold"
                                : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1D23]"
                            }`}
                          >
                            <Server className="w-3.5 h-3.5" />
                            🖥️ Tablet/Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewportPerspective("mobile")}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                              viewportPerspective === "mobile"
                                ? "bg-[#F27D26] text-black font-extrabold"
                                : "text-[#A0A0A0] hover:text-white hover:bg-[#1A1D23]"
                            }`}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                            📱 Mobile (No Login)
                          </button>
                        </div>
                      </div>

                      {/* RENDERING SMARTPHONE PREVIEW PERSPECTIVE */}
                      {viewportPerspective === "mobile" ? (
                        <div className="flex justify-center py-4 bg-[#0F1115] rounded-2xl border border-[#2A2D35] p-4">
                          {/* Inner phone wrapper */}
                          <div className="relative w-full max-w-[375px] bg-[#12141A] border-[8px] border-[#2A2D35] rounded-[40px] shadow-2xl flex flex-col overflow-hidden h-[740px] ring-4 ring-[#F27D26]/5">
                            
                            {/* Smartphone top bezel camera notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-[#2A2D35] rounded-b-xl z-20 flex items-center justify-center">
                              <div className="w-10 h-1 bg-[#0F1115] rounded-full mr-2"></div>
                              <div className="w-2 h-2 bg-[#0F1115] rounded-full border border-slate-700"></div>
                            </div>

                            {/* Simulated Smartphone Screen OS Environment */}
                            <div className="flex-1 overflow-y-auto pt-6 flex flex-col h-full scrollbar-none select-none relative">
                              {/* OS Status Bar */}
                              <div className="px-4 py-1 flex justify-between items-center text-[9px] font-mono text-[#5C616F] shrink-0 bg-[#0F1115]">
                                <span>09:41 AM</span>
                                <div className="flex items-center gap-1 font-sans">
                                  <span>5G 📶</span>
                                  <span>100% 🔋</span>
                                </div>
                              </div>

                              {/* Browser address bar replica */}
                              <div className="bg-[#1A1D23] px-3 py-1.5 border-b border-[#2A2D35] flex items-center justify-between shrink-0">
                                <span className="text-[10px] font-mono text-[#A0A0A0] truncate flex items-center gap-1">
                                  🔒 sign.conceptengineers.com.au/...
                                </span>
                                <span className="text-[10px] font-bold text-[#F27D26]">Refreshed</span>
                              </div>

                              {/* Security banner explaining NO LOGIN required */}
                              <div className="bg-[#142A24] border-b border-[#1E4D3E] p-3 text-xs text-white shrink-0">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wide">
                                  <Shield className="w-3.5 h-3.5 shrink-0" />
                                  Secure Token Login Link
                                </div>
                                <p className="text-[10.5px] text-[#A0A0A0] mt-1 leading-normal">
                                  System verified individual token. Client <strong>{signerName || "Representative"}</strong> is signing without need for credentials or registration.
                                </p>
                              </div>

                              {/* CHOSEN ENGINE: ENTIRE NATIVE PORTAL SIMULATOR INSIDE THE SMARTPHONE */}
                              {signingEngine === "portal" ? (
                                <div className="p-4 space-y-4 flex-1 flex flex-col bg-[#0F1115]">
                                  <div className="rounded-lg border border-[#2A2D35] bg-[#1A1D23] p-3 text-left">
                                    <h4 className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase mb-1">Contract summary</h4>
                                    <p className="text-white text-xs font-bold truncate">{clientName}</p>
                                    <p className="text-[#A0A0A0] text-[10px] truncate">{projectAddress}</p>
                                    <p className="text-white text-xs font-mono font-bold mt-1">${parseFloat(fee).toLocaleString("en-AU")} AUD (ex. GST)</p>
                                  </div>

                                  {/* Custom Scope Scroll Area */}
                                  <div className="rounded-lg border border-[#2A2D35] bg-[#0F1115] p-3 h-48 overflow-y-auto text-[9.5px] font-mono text-[#C0C0C0] leading-relaxed select-text shadow-inner">
                                    <div className="border-b border-[#2A2D35] pb-2 mb-2 text-center">
                                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#F27D26] block">Legal Document View</span>
                                      <span className="text-[8px] text-[#5C616F]">AS (AUSTRALIAN CODES) STANDARD</span>
                                    </div>
                                    <div className="whitespace-pre-wrap font-sans text-[10px] text-[#D0D0D0]">
                                      {generatedProposal}
                                    </div>
                                  </div>

                                  {/* SMS Validation step if toggled */}
                                  {smsVerification && !smsVerified ? (
                                    <div className="p-3 rounded-lg border border-amber-900/50 bg-amber-950/25 space-y-2">
                                      <span className="font-mono text-[9px] font-extrabold text-amber-400 uppercase tracking-wild flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> SMS Authentication Lock
                                      </span>
                                      <p className="text-[10px] text-[#A0A0A0] leading-tight">
                                        To draw your signature on the digital canvas, verify your mobile number.
                                      </p>
                                      {!smsSent ? (
                                        <button
                                          type="button"
                                          onClick={() => setSmsSent(true)}
                                          className="w-full py-1.5 rounded bg-[#F27D26] hover:bg-orange-400 text-black text-[11px] font-bold transition-all"
                                        >
                                          Send Mock SMS code (1234)
                                        </button>
                                      ) : (
                                        <div className="space-y-1.5">
                                          <div className="text-[9.5px] text-emerald-400 font-mono">🔐 Mock SMS Sent! Code to input is: <strong className="underline">1234</strong></div>
                                          <div className="flex gap-1.5">
                                            <input
                                              type="text"
                                              maxLength={4}
                                              value={verificationCode}
                                              onChange={(e) => setVerificationCode(e.target.value)}
                                              placeholder="Enter 4-Digit Code"
                                              className="flex-1 bg-[#1A1D23] border border-[#3D414D] rounded-md p-1.5 text-center text-xs text-white focus:outline-hidden font-bold"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (verificationCode === "1234") {
                                                  setSmsVerified(true);
                                                } else {
                                                  alert("Invalid mock simulation code! Type '1234' to verify.");
                                                }
                                              }}
                                              className="px-3 bg-emerald-500 text-black text-xs font-bold rounded-md hover:bg-emerald-400"
                                            >
                                              Verify
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    /* Active Mobile Signature pad */
                                    <div className="space-y-2.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold uppercase text-[#5C616F]">Mobile Ink Sign Pad</span>
                                        <button
                                          type="button"
                                          onClick={clearCanvas}
                                          className="text-[9.5px] text-red-400 font-bold hover:text-red-300"
                                        >
                                          Clear Canvas
                                        </button>
                                      </div>

                                      {/* Responsive touch-enabled drawing canvas block */}
                                      <div className="relative border-2 border-dashed border-[#3D414D] rounded-xl bg-black overflow-hidden cursor-crosshair">
                                        {signProgress === "pending" ? (
                                          <canvas
                                            ref={canvasRef}
                                            width={320}
                                            height={120}
                                            style={{ width: "100%", height: "120px" }}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                          />
                                        ) : (
                                          <div className="h-[120px] flex items-center justify-center p-2 bg-[#1A1D23]">
                                            {canvasUrl ? (
                                              <div className="relative text-center">
                                                <img
                                                  src={canvasUrl}
                                                  alt="Sealed Client Signature"
                                                  className="mx-auto max-h-[85px] object-contain invert brightness-125"
                                                />
                                                <span className="text-[10px] font-mono text-emerald-400 block mt-1 font-bold">
                                                  ✓ Signature Sealed
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-xs text-[#A0A0A0]">Digitized and validated</span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Seal execution control */}
                                      <div className="pt-2">
                                        {signProgress === "pending" ? (
                                          <button
                                            type="button"
                                            onClick={handleSealSignature}
                                            className="w-full inline-flex items-center justify-center rounded-xl bg-[#F27D26] hover:bg-orange-400 font-extrabold transition-all px-3 py-2.5 text-xs text-black"
                                          >
                                            <Signature className="mr-1.5 h-3.5 w-3.5" />
                                            Tap to Instant Seal and Sign
                                          </button>
                                        ) : (
                                          <div className="space-y-1.5">
                                            <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-[11px] bg-[#142A24] border border-[#1E4D3E] p-2.5 rounded-lg">
                                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                                              <span>Agreement Signed from Mobile!</span>
                                            </div>
                                            <button
                                              onClick={() => {
                                                setGeneratedProposal(null);
                                                clearCanvas();
                                                setSignProgress("pending");
                                                setSmsVerified(false);
                                                setSmsSent(false);
                                                setVerificationCode("");
                                              }}
                                              className="w-full py-2 bg-[#21242C] border border-[#3D414D] text-[#A0A0A0] text-xs font-bold rounded-lg hover:text-white"
                                            >
                                              Reset Simulator
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* CHOSEN ENGINE: DOCUSEAL CLIENT VIEW SIMULATOR INSIDE THE SMARTPHONE */
                                <div className="p-4 space-y-4 flex-1 flex flex-col bg-[#0F1115]">
                                  <div className="rounded-lg border border-[#311C47] bg-[#1a1226] p-3 text-left">
                                    <span className="font-mono text-[8px] uppercase text-purple-400 font-extrabold">Enterprise Dispatch Hub</span>
                                    <h4 className="text-[11px] font-bold text-white mt-1">DocuSeal Mobile Request</h4>
                                    <span className="text-[10px] text-[#A0A0A0] block mt-0.5">Concept Engineers uploaded contract</span>
                                  </div>

                                  {docusealStatus === "sent" ? (
                                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                                      {/* Mock DocuSeal Embedded Signature Sheet */}
                                      <div className="border border-purple-900/50 rounded-xl bg-[#120F1C] p-3 shadow-inner flex-1 flex flex-col justify-between text-left">
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between border-b border-[#2d2242] pb-1.5 text-[9px] font-mono text-purple-300">
                                            <span>docuseal.co/sign/inv_91238</span>
                                            <span className="font-bold">2 FIELDS REMAINING</span>
                                          </div>
                                          
                                          <label className="text-[9px] font-mono uppercase text-purple-400 flex justify-between">
                                            <span>Field 1: Representative Name</span>
                                            <span className="text-red-400 font-bold">*required</span>
                                          </label>
                                          <input
                                            type="text"
                                            readOnly
                                            value={clientName}
                                            className="w-full bg-[#1A1829] border border-purple-900/60 rounded-md p-1.5 text-xs text-white"
                                          />

                                          <label className="text-[9px] font-mono uppercase text-purple-400 flex justify-between">
                                            <span>Field 2: Location Address Confirmation</span>
                                            <span className="text-red-400 font-bold">*required</span>
                                          </label>
                                          <input
                                            type="text"
                                            readOnly
                                            value={projectAddress}
                                            className="w-full bg-[#1A1829] border border-purple-900/60 rounded-md p-1.5 text-[10.5px] text-[#A0A0A0]"
                                          />

                                          <div className="border border-dashed border-purple-800/40 bg-purple-950/15 rounded-lg p-2.5 text-center mt-3">
                                            <span className="block text-[8px] font-mono uppercase text-purple-300 mb-1">Finger Signature Seal Area</span>
                                            <div className="h-16 bg-[#130E21] border border-purple-900/40 rounded flex items-center justify-center cursor-pointer hover:border-[#F27D26]" onClick={() => setDocusealStatus("signing_completed")}>
                                              <span className="text-[10px] text-purple-400 italic">Click here to Sign in DocuSeal</span>
                                            </div>
                                          </div>
                                        </div>

                                        <p className="text-[8.5px] text-[#5C616F] text-center mt-2 leading-tight">
                                          DocuSeal self-hosted engine fully isolates and respects regional data residency guidelines.
                                        </p>
                                      </div>
                                    </div>
                                  ) : docusealStatus === "signing_completed" ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4">
                                      <div className="h-12 w-12 rounded-full bg-purple-950 border border-purple-500 text-purple-300 flex items-center justify-center animate-bounce shadow">
                                        <Check className="h-6 w-6" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-white">DocuSeal Complete!</h4>
                                        <p className="text-[10.5px] text-[#A0A0A0] mt-1.5 leading-normal">
                                          The client signature has been validated and recorded securely within the local system audit archive files. No logins or passwords needed.
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setDocusealStatus("sent")}
                                        className="py-1.5 px-4 rounded bg-purple-900 text-white text-xs font-bold hover:bg-purple-800"
                                      >
                                        Re-sign Envelope
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4">
                                      <div className="h-9 w-9 rounded-full bg-[#1A1D23] border border-[#2A2D35] flex items-center justify-center text-purple-400">
                                        <Send className="h-4.5 w-4.5" />
                                      </div>
                                      <p className="text-xs text-[#A0A0A0]">
                                        Please dispatch the DocuSeal envelope from the desktop panel first to initiate mobile client signature request.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Home Slider bar */}
                            <div className="absolute bottom-1 w-28 h-1 bg-[#2A2D35] rounded-full left-1/2 -translate-x-1/2 z-20"></div>
                          </div>
                        </div>
                      ) : (
                        /* STANDARD DESKTOP/TABLET VIEW */
                        <div className="space-y-6">
                          
                          {/* CHOSEN ENGINE: DOCUSEAL ENTERPRISE PANEL */}
                          {signingEngine === "docuseal" ? (
                            <div className="rounded-2xl border border-[#311C47] bg-[#150F21] p-5 shadow-xl space-y-5">
                              <div className="flex items-center justify-between pb-3.5 border-b border-[#311C47]">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-lg bg-[#2E0B4E] border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold font-mono text-base">
                                    D
                                  </div>
                                  <div>
                                    <h4 className="font-display font-bold text-white text-sm uppercase tracking-wide">DocuSeal Enterprise Dispatcher</h4>
                                    <span className="text-[10px] font-mono text-purple-400">DigitalOcean Self-Hosted container simulation</span>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] text-[#F27D26] bg-[#21242C] px-2.5 py-0.5 rounded border border-[#F27D26]/20 font-bold">
                                  API Queue: Listening
                                </span>
                              </div>

                              {/* Live JSON Payload visualizer */}
                              <div className="space-y-4">
                                <span className="text-[11px] text-[#A0A0A0] leading-relaxed block">
                                  DocuSeal maps variables statically typed inside MS Word (.docx) templates like <code className="bg-[#2E184A] px-1 text-purple-300">{"{client_name}"}</code> or <code className="bg-[#2E184A] px-1 text-purple-300">{"{project_address}"}</code> directly from custom payloads.
                                </span>

                                <div className="rounded-xl bg-[#0B0813] border border-[#301F4E] p-4 font-mono text-xs">
                                  <div className="flex justify-between items-center text-[10px] text-purple-400 border-b border-[#221538] pb-1.5 mb-2">
                                    <span>POST /v1/submissions (DocuSeal API Request)</span>
                                    <span>Payload Config</span>
                                  </div>
                                  <pre className="text-[11px] text-[#D4C3FB] overflow-x-auto whitespace-pre leading-relaxed text-left">
{`{
  "template_id": "${docusealTemplateId}",
  "submitters": [
    {
      "role": "Client",
      "email": "${clientEmail || "client@metrohomes.com"}",
      "name": "${clientName || "John Smith"}",
      "fields": [
        { "name": "${docusealFieldMapping.clientNamePlaceholder}", "value": "${clientName || "John Smith"}" },
        { "name": "${docusealFieldMapping.addressPlaceholder}", "value": "${projectAddress || "Lot 2A, Broadwater Way"}" },
        { "name": "${docusealFieldMapping.feePlaceholder}", "value": "$${parseFloat(fee).toLocaleString("en-AU")} AUD (ex. GST)" }
      ]
    }
  ]
}`}
                                  </pre>
                                </div>

                                {/* Send / Publish controls */}
                                <div className="pt-3 border-t border-[#311C47] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                                  <div className="text-left">
                                    <span className="text-[10px] uppercase font-mono text-[#5C616F] block">Invitee Email</span>
                                    <span className="text-white text-xs font-semibold">{clientEmail || "client@metrohomes.com"}</span>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDocusealStatus("preparing");
                                        setTimeout(() => {
                                          setDocusealStatus("sent");
                                          alert("DocuSeal Simulated Request Published! Switch viewport perspective to Mobile to sign without logging in!");
                                        }, 1000);
                                      }}
                                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-[#F27D26] hover:from-purple-500 hover:to-orange-400 font-extrabold text-xs text-white shadow"
                                    >
                                      {docusealStatus === "preparing" ? "Syncing variables..." : "Publish & Send DocuSeal Invitation"}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Embedded simulator of DocuSeal dashboard */}
                              {docusealStatus === "sent" || docusealStatus === "signing_completed" ? (
                                <div className="p-4 rounded-xl bg-[#0E0B16] border border-purple-900/40 text-left space-y-4">
                                  <div className="flex items-center justify-between text-xs text-[#A0A0A0] border-b border-[#201A33] pb-2">
                                    <span className="font-mono text-xs">DocuSeal Embedded Console sandbox</span>
                                    <span className="text-[9.5px] text-emerald-400 font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Envelope Sent
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[260px]">
                                    <div className="md:col-span-8 bg-[#151121] border border-[#2A1D42] rounded-lg p-4 overflow-y-auto text-xs space-y-3 font-mono">
                                      <span className="text-[10.5px] font-bold text-white uppercase block mb-3 border-b border-[#2d2242] pb-1">CONSTRUCTED SERVICES PROPOSAL (DocuSeal PDF View)</span>
                                      <div className="space-y-2 font-sans text-[#A0A0A0]">
                                        <p><strong>RE:</strong> Engineering Services for <strong>{projectType}</strong> Project at <strong>{projectAddress}</strong>.</p>
                                        <p>Total consideration payable on completion representing standard compliance is <strong>${parseFloat(fee).toLocaleString("en-AU")} AUD (ex. GST)</strong>.</p>
                                      </div>
                                    </div>
                                    <div className="md:col-span-4 bg-[#1B162C] border border-[#2C1D42] rounded-lg p-3 flex flex-col justify-between">
                                      <span className="text-[10px] font-mono font-bold uppercase text-purple-300">Target Action Fields</span>
                                      
                                      {docusealStatus === "signing_completed" ? (
                                        <div className="text-center p-3 bg-purple-950/30 border border-purple-900/60 rounded-md">
                                          <Check className="h-5 w-5 text-emerald-400 mx-auto" />
                                          <span className="text-[11px] text-white font-bold block mt-1">Submitter Completed</span>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDocusealStatus("signing_completed");
                                            // Archive it
                                            const newContract = {
                                              id: "PROP-" + Math.floor(10000 + Math.random() * 90000),
                                              clientName: clientName || "Anonymous Representative",
                                              projectType,
                                              projectAddress: projectAddress || "Address standard check",
                                              fee: fee || "3500",
                                              date: new Date().toLocaleDateString("en-AU"),
                                              status: "Signed",
                                              signatureUrl: "docuseal_digital_verified",
                                              auditHash: "DOCUSEAL:" + Math.random().toString(16).substring(2, 9).toUpperCase()
                                            };
                                            setContractsArchive([newContract, ...contractsArchive]);
                                          }}
                                          className="w-full py-2 bg-[#F27D26] hover:bg-orange-400 text-black font-extrabold text-xs rounded-lg"
                                        >
                                          Sign instantly here
                                        </button>
                                      )}

                                      <p className="text-[9px] text-[#A0A0A0]">
                                        Submitter completes with 0 downloads required.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            /* PORTAL DIRECT: STANDARD COMPREHENSIVE VIEW */
                            <div className="space-y-6">
                              {/* Interactive Link Proxy Card */}
                              <div className="rounded-2xl border border-[#2A2D35] bg-[#1A1D23] p-5 shadow-xl">
                                <div className="flex items-center justify-between pb-3.5 border-b border-[#2A2D35] mb-4">
                                  <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="h-4 w-4 text-[#F27D26]" />
                                    Secure Customized Domain link
                                  </h4>
                                  <span className="font-mono text-[9px] text-[#F27D26] bg-[#21242C] px-2.5 py-0.5 rounded border border-[#F27D26]/20 font-bold">
                                    SSL Sec: Valid (HTTPS)
                                  </span>
                                </div>

                                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 items-stretch">
                                  <div className="flex-1">
                                    <label className="text-[10px] font-mono font-bold uppercase text-[#5C616F] tracking-wider">
                                      A-Record Target Domain Link (DocuSeal Link Proxy)
                                    </label>
                                    <div className="mt-1.5 flex rounded-lg overflow-hidden border border-[#3D414D]">
                                      <span className="inline-flex items-center bg-[#0F1115] px-3 text-xs font-mono text-[#5C616F] select-all border-r border-[#3D414D]">
                                        sign.conceptengineers.com.au/sign/
                                      </span>
                                      <input
                                        type="text"
                                        readOnly
                                        value={`proposal_${projectType.toLowerCase()}_${clientName.replace(/\s+/g, "").toLowerCase().substring(0, 8)}`}
                                        className="block w-full min-w-0 bg-[#0F1115] p-2 text-xs font-mono text-white focus:outline-hidden"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-end">
                                    <button
                                      type="button"
                                      onClick={handleCopyText}
                                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-[#3D414D] bg-[#0F1115] text-white hover:bg-[#21242C] hover:border-[#F27D26] px-4 py-2.5 text-xs font-bold transition-all"
                                    >
                                      <Copy className="mr-1.5 h-3.5 w-3.5 text-[#F27D26]" />
                                      {copiedText ? "Copied" : "Copy Content"}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Professional Contract Sandbox Window */}
                              <div className="rounded-2xl border border-[#2A2D35] bg-[#1A1D23] shadow-2xl overflow-hidden">
                                
                                {/* Interactive DocuSeal Header Block */}
                                <div className="bg-[#0F1115] px-5 py-3.5 flex items-center justify-between text-white border-b border-[#2A2D35]">
                                  <div className="flex items-center space-x-2.5">
                                    <Signature className="h-4.5 w-4.5 text-[#F27D26]" />
                                    <span className="text-xs font-mono tracking-wider font-semibold text-white/90">
                                      sign.conceptengineers.com.au — Client Mobile Sign Sheet
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Active</span>
                                  </div>
                                </div>

                                {/* Split Interface: Scrollable Text + Signing Panel */}
                                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                                  
                                  {/* Left Half: Embedded Proposal Contract Content */}
                                  <div id="document-viewer" className="md:col-span-7 bg-[#0F1115] border-r border-[#2A2D35] p-6 text-sm text-[#E0E0E0] max-h-[500px] overflow-y-auto select-text font-mono scrollbar-thin">
                                    {loading ? (
                                      <div className="flex flex-col items-center justify-center h-full space-y-3 py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F27D26]"></div>
                                        <span className="text-xs font-mono text-[#A0A0A0]">Drafting scope items...</span>
                                      </div>
                                    ) : (
                                      <div className="prose prose-invert max-w-none text-xs text-left">
                                        {/* Corporate Header Layout */}
                                        <div className="border-b-2 border-[#2A2D35] pb-4 mb-5 flex justify-between items-start">
                                          <div>
                                            <h4 className="font-display text-base font-bold text-white tracking-tight uppercase">
                                              CONCEPT ENGINEERS PTY LTD
                                            </h4>
                                            <p className="text-[9px] text-[#A0A0A0] font-mono mt-0.5">
                                              AS Civil & Structural Registered Consultants • sign.conceptengineers.com.au
                                            </p>
                                          </div>
                                          <div>
                                            <span className="rounded bg-[#21242C] border border-[#F27D26]/30 px-2 py-0.5 text-[9px] font-mono font-bold text-[#F27D26] uppercase">
                                              E-SIGN CONTRACT
                                            </span>
                                          </div>
                                        </div>
                                        <div className="whitespace-pre-wrap font-sans text-[#E0E0E0] leading-relaxed text-xs">
                                          {generatedProposal}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right Half: Mobile Sign Pad Frame */}
                                  <div className="md:col-span-5 bg-[#191C21] p-5 flex flex-col justify-between border-t md:border-t-0 border-[#2A2D35] text-left">
                                    <div>
                                      <div className="flex items-center space-x-2 text-[#F27D26] mb-2.5">
                                        <FileCheck className="h-4.5 w-4.5" />
                                        <h5 className="font-display font-semibold text-white text-xs uppercase tracking-wider">
                                          Verification E-Sign Pad
                                        </h5>
                                      </div>
                                      <p className="text-[11px] text-[#A0A0A0] mb-4 leading-relaxed">
                                        Clients securely sign from any touchscreen or cursor with 0 logging credentials required. Draw on the block to digitize.
                                      </p>

                                      <div className="space-y-4">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[9px] font-mono font-bold uppercase text-[#5C616F]">
                                            Signer Signature Name
                                          </label>
                                          <input
                                            type="text"
                                            value={signerName}
                                            onChange={(e) => setSignerName(e.target.value)}
                                            placeholder="Confirm Signer Name"
                                            className="bg-[#0F1115] border border-[#3D414D] rounded-md p-2 text-xs text-white focus:outline-none focus:border-[#F27D26] transition-all"
                                          />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                          <label className="text-[9px] font-mono font-bold uppercase text-[#5C616F]">
                                            System Signing Timestamp
                                          </label>
                                          <input
                                            type="text"
                                            disabled
                                            value={signerDate}
                                            className="bg-[#0F1115] border border-[#2A2D35] rounded-md p-2 text-xs text-[#A0A0A0] font-mono"
                                          />
                                        </div>
                                      </div>

                                      {/* Canvas Box */}
                                      <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-[9px] font-mono font-bold uppercase text-[#5C616F]">
                                            Digital Ink Canvas
                                          </label>
                                          <button
                                            onClick={clearCanvas}
                                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                                          >
                                            Reset / Clear
                                          </button>
                                        </div>

                                        <div className="relative border-2 border-dashed border-[#3D414D] rounded-lg bg-[#0F1115] overflow-hidden cursor-crosshair">
                                          {signProgress === "pending" ? (
                                            <canvas
                                              ref={canvasRef}
                                              width={300}
                                              height={140}
                                              style={{ width: "100%", height: "140px" }}
                                              onMouseDown={startDrawing}
                                              onMouseMove={draw}
                                              onMouseUp={stopDrawing}
                                              onMouseLeave={stopDrawing}
                                              onTouchStart={startDrawing}
                                              onTouchMove={draw}
                                              onTouchEnd={stopDrawing}
                                            />
                                          ) : (
                                            <div className="h-[140px] flex items-center justify-center p-2 bg-[#21242C]">
                                              {canvasUrl ? (
                                                <div className="relative text-center">
                                                  <img
                                                    src={canvasUrl}
                                                    alt="Sealed Client Signature"
                                                    className="mx-auto max-h-[100px] object-contain invert brightness-125"
                                                  />
                                                  <span className="text-[9px] font-mono text-emerald-400 block mt-1.5 font-bold">
                                                    Signature Sealed
                                                  </span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-[#A0A0A0]">Digitized and validated</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#2A2D35] mt-4 space-y-2">
                                      {signProgress === "pending" ? (
                                        <button
                                          type="button"
                                          onClick={handleSealSignature}
                                          className="w-full inline-flex items-center justify-center rounded-lg bg-[#F27D26] hover:bg-orange-400 font-bold transition-all px-3 py-2.5 text-xs text-black shadow-md shadow-orange-950/20"
                                        >
                                          <Signature className="mr-1.5 h-3.5 w-3.5" />
                                          Execute & Digitally Seal Agreement
                                        </button>
                                      ) : (
                                        <div className="space-y-2.5">
                                          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs bg-[#142A24] border border-[#1E4D3E] p-3 rounded-lg">
                                            <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
                                            <span>Success! Vault Transaction Executed</span>
                                          </div>
                                          <button
                                            onClick={() => {
                                              setGeneratedProposal(null);
                                              clearCanvas();
                                              setSignProgress("pending");
                                            }}
                                            className="w-full inline-flex items-center justify-center rounded-lg border border-[#3D414D] bg-[#0F1115] hover:bg-[#1A1D23] px-3.5 py-2.5 text-xs font-bold text-white transition-all"
                                          >
                                            Prepare Next Proposal Form
                                          </button>
                                        </div>
                                      )}
                                      <p className="text-[9px] text-[#5C616F] text-center font-mono">
                                        Generates secure SHA-256 audit trails directly on sign.conceptengineers.com.au.
                                      </p>
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Proposals ledger section */}
              <div className="rounded-2xl border border-[#2A2D35] bg-[#1A1D23] p-6 shadow-xl mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2A2D35] pb-4 mb-4 gap-3">
                  <div>
                    <h4 className="font-display font-bold text-white text-base">
                      Recent Agreements & Sign History Audit Ledger
                    </h4>
                    <p className="text-xs text-[#A0A0A0] mt-0.5">Historical logs of generated proposals loaded dynamically inside the local storage database.</p>
                  </div>
                  <span className="text-xs font-mono bg-[#0F1115] border border-[#3D414D] text-[#F27D26] font-bold px-3 py-1 rounded-md shrink-0 self-start sm:self-center">
                    {contractsArchive.length} Total Contracts
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#2A2D35] text-left text-xs text-[#A0A0A0]">
                    <thead className="bg-[#0F1115] text-[9.5px] font-mono font-bold text-[#5C616F] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Proposal ID</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Client Entity</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Project Type</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Location Address</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Fixed Fee (ex. GST)</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Audit Date</th>
                        <th className="px-4 py-3 border-b border-[#2A2D35]">Status</th>
                        <th className="px-4 py-3 text-right border-b border-[#2A2D35]">Verification Record</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2D35] bg-[#1A1D23] font-medium text-slate-300">
                      {contractsArchive.map((item) => (
                        <tr key={item.id} className="hover:bg-[#21242C] transition-colors">
                          <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-white">
                            {item.id}
                          </td>
                          <td className="px-4 py-3 text-white font-semibold">
                            {item.clientName}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold ${
                              item.projectType === "Residential" && "bg-blue-950 text-blue-300 border border-blue-800" ||
                              item.projectType === "Commercial" && "bg-purple-950 text-purple-300 border border-purple-800" ||
                              item.projectType === "Subdivision" && "bg-amber-950 text-amber-300 border border-amber-800" ||
                              "bg-[#0F1115] text-[#A0A0A0] border border-[#2A2D35]"
                            }`}>
                              {item.projectType}
                            </span>
                          </td>
                          <td className="px-4 py-3 max-w-[180px] truncate text-[#A0A0A0]" title={item.projectAddress}>
                            {item.projectAddress}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-white">
                            ${parseFloat(item.fee).toLocaleString("en-AU")} AUD
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-[#A0A0A0]">
                            {item.date}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold ${
                              item.status === "Signed" ? "bg-[#142A24] text-green-400 border border-emerald-950" : "bg-amber-950/40 text-amber-400 border border-amber-900"
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[10px] text-[#A0A0A0]">
                            {item.auditHash || <span className="italic text-[#5C616F]">Awaiting Link...</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "playbook" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
              key="playbook-section"
            >
              <div className="border border-[#2A2D35] bg-[#1A1D23] rounded-2xl shadow-xl p-6 sm:p-8">
                <h3 className="font-display font-medium text-xl text-white mb-2">
                  Architecture & Implementation Playbook
                </h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed mb-6">
                  This customized playbook details exactly how to deploy and integrate your **Concept Engineers E-Sign Environment (sign.conceptengineers.com.au)** using low-cost self-hosted Docker options, easily fitting under your ~$10 USD/month budget goal.
                </p>

                {/* Grid Layout for major architectural guides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option 1: No-code backends */}
                  <div className="border border-[#2A2D35] bg-[#0F1115] rounded-xl p-6 hover:border-[#F27D26] transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#21242C] border border-[#2A2D35] text-[#F27D26] mb-4">
                      <Database className="h-6 w-6" />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mb-2">
                      Possibilities: No-Code Databases vs Built-In Template Workflows
                    </h4>
                    <p className="text-[#A0A0A0] text-xs leading-relaxed mb-4">
                      Yes! It is entirely possible to implement this with very simple no-code configurations:
                    </p>
                    <ul className="space-y-2 text-xs text-[#E0E0E0] leading-normal pl-4 list-disc">
                      <li>
                        <strong>DocuSeal Native Forms (No-Code):</strong> Simply upload a blank template PDF into DocuSeal and define input fields visually. Your internal staff types client details directly within DocuSeal itself, automatically formatting the contract and preparing a link containing variables. This requires 0 programming.
                      </li>
                      <li>
                        <strong>Airtable / Google Sheets + Make:</strong> Create a form inside Airtable for project details. Trigger **Make.com** on submission to auto-populate a Google Slides or Google Docs contract template, export as PDF, and push into DocuSeal. Secure and fast.
                      </li>
                    </ul>
                  </div>

                  {/* Option 2: What is NOT possible */}
                  <div className="border border-[#2A2D35] bg-[#0F1115] rounded-xl p-6 hover:border-red-500/50 transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-950/20 border border-red-900/40 text-red-400 mb-4">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mb-2">
                      What is NOT Possible or Strongly Restrictive
                    </h4>
                    <p className="text-[#A0A0A0] text-xs leading-relaxed mb-4">
                      To keep complexity to an absolute minimum, steer clear of the following over-engineered paths:
                    </p>
                    <ul className="space-y-2 text-xs text-[#E0E0E0] leading-normal pl-4 list-disc">
                      <li>
                        <strong>Dynamic MS Word Logic:</strong> Programmatic folding of a single Word Document to drop multiple pages on specific scenarios requires heavy code SDK setups (like Python-docx or server-side automation). Instead, simply make 3 distinct document files in DocuSeal, which natively keeps the layout clean.
                      </li>
                      <li>
                        <strong>Custom Domain SSL on Free Platforms:</strong> Conventional SaaS sign hosts (like DocuSign or Adobe Sign) block custom domain mapping on their entry-level plans. It usually requires high-tier enterprise subscriptions, making self-hosting critical to support <code className="font-mono text-[#F27D26]">sign.conceptengineers.com.au</code>.
                      </li>
                    </ul>
                  </div>

                  {/* Option 3: VPS Setup */}
                  <div className="border border-[#2A2D35] bg-[#0F1115] rounded-xl p-6 md:col-span-2 hover:border-[#F27D26] transition-colors">
                    <div className="flex items-center space-x-3 mb-4.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#21242C] border border-[#2A2D35] text-emerald-400">
                        <Server className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">
                          Docker Setup for DigitalOcean droplet ($5-$6 / month)
                        </h4>
                        <p className="text-[10px] font-mono text-[#5C616F] uppercase">Sleek Flat Fee Hosting Specification</p>
                      </div>
                    </div>

                    <p className="text-[#A0A0A0] text-xs leading-relaxed mb-4">
                      By deploying the DocuSeal container on a lightweight VPS, you pay absolutely no scaling fees or transactional signature charges. Here is your operational Docker-Compose file:
                    </p>

                    <div className="rounded-xl bg-[#0F1115] p-4 border border-[#2A2D35]">
                      <div className="flex items-center justify-between text-[10px] text-[#5C616F] font-mono mb-2 border-b border-[#2A2D35] pb-2">
                        <span>/srv/docuseal/docker-compose.yml</span>
                        <span className="text-emerald-400 font-bold">100% Production Ready</span>
                      </div>
                      <pre className="text-[11px] font-mono text-[#E0E0E0] overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin">
{`version: '3.8'

services:
  docuseal:
    image: docuseal/docuseal:latest
    container_name: docuseal-vps-app
    ports:
      - "4000:4000"
    volumes:
      - docuseal_data:/data
    environment:
      - DATABASE_URL=sqlite3:///data/docuseal.db
      - PORT=4000
      - HOSTNAME=sign.conceptengineers.com.au
    restart: always

volumes:
  docuseal_data:
`}
                      </pre>
                    </div>
                  </div>

                  {/* Option 4: DNS Configuration */}
                  <div className="border border-[#2A2D35] bg-[#0F1115] rounded-xl p-6 hover:border-[#F27D26] transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#21242C] border border-[#2A2D35] text-[#F27D26] mb-4">
                      <Globe className="h-6 w-6" />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mb-2">
                      Custom Subdomain Domain Settings
                    </h4>
                    <p className="text-[#A0A0A0] text-xs leading-relaxed mb-3">
                      To successfully point <code className="font-mono text-white bg-[#1A1D23] px-1 rounded">sign.conceptengineers.com.au</code> to your signing portal:
                    </p>
                    <ol className="space-y-4 text-xs text-[#E0E0E0] leading-normal list-decimal pl-4">
                      <li>
                        Under your domain host, configure a new <strong>A-Record</strong>:
                        <ul className="pl-3 list-disc mt-1 text-[#A0A0A0] font-mono text-[10px] space-y-0.5">
                          <li>Host name: <code className="text-[#F27D26]">sign</code></li>
                          <li>Destination IPv4: <code className="text-white">[Droplet Public IP Address]</code></li>
                        </ul>
                      </li>
                      <li>
                        Establish a high-performance reverse proxy which manages Let's Encrypt HTTPS certificates securely. Here is your Caddy configuration:
                        <div className="mt-2 bg-[#1A1D23] border border-[#2A2D35] p-2.5 rounded-lg text-[#E0E0E0] font-mono text-[10px]">
                          sign.conceptengineers.com.au {"{"} <br />
                          &nbsp;&nbsp;reverse_proxy localhost:4000 <br />
                          {"}"}
                        </div>
                      </li>
                    </ol>
                  </div>

                  {/* Option 5: DocuSeal variables inside DOCX template */}
                  <div className="border border-[#2A2D35] bg-[#0F1115] rounded-xl p-6 hover:border-[#F27D26] transition-colors">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#21242C] border border-[#2A2D35] text-purple-400 mb-4">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <h4 className="font-display font-bold text-white text-sm mb-2">
                       Setting up MS Word Placeholders
                    </h4>
                    <p className="text-[#A0A0A0] text-xs leading-relaxed mb-3">
                      To embed inputs inside Word documents so DocuSeal reads them dynamically:
                    </p>
                    <ul className="space-y-2 text-xs text-[#E0E0E0] leading-normal pl-4 list-disc">
                      <li>
                        Type variables inside curly brackets anywhere in your text: eg. <code className="font-mono bg-[#1A1D23] border border-[#2A2D35] px-1 text-purple-300">{"{client_name}"}</code>, <code className="font-mono bg-[#1A1D23] border border-[#2A2D35] px-1 text-purple-300">{"{project_address}"}</code>, or <code className="font-mono bg-[#1A1D23] border border-[#2A2D35] px-1 text-purple-300">{"{fee}"}</code>.
                      </li>
                      <li>
                        On file upload, DocuSeal's engine automatically recognizes these tags, converts them into fillable input cards, and binds them to your custom signing link.
                      </li>
                      <li>
                        Staff can fill in variables via a simple form, and send the link. The client views the finished proposal from their phone without downloading any app.
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Direct Action Plan banner */}
                <div className="mt-8 border-t border-[#2A2D35] pt-6 flex items-start gap-4 bg-[#21242C]/40 p-5 rounded-xl border">
                  <Info className="h-5 w-5 text-[#F27D26] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-display font-bold text-white text-sm mb-1">
                      Our Clear Recommendation for Concept Engineers
                    </h4>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">
                      Deploy the DocuSeal container using DigitalOcean Droplets. Avoid custom integrations or expensive APIs in the beginning. Prepare three distinct MS Word template configurations (.docx) for **Residential**, **Commercial**, and **Subdivision**, with embedded curly-bracket variables. Upload them to your portal interface. This delivers a zero-maintenance e-signing platform with 100% data privacy and keeps ongoing costs capped at **$6/month flat**.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant Dark Footer System */}
      <footer className="bg-[#0F1115] border-t border-[#2A2D35] py-10 mt-16 text-xs text-[#5C616F]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4">
          <div>
            <p className="font-medium text-[#A0A0A0]">
              &copy; {new Date().getFullYear()} Concept Engineers Pty Ltd. All Rights Reserved.
            </p>
            <p className="text-[10px] text-[#5C616F] mt-1 font-mono">
              Professional Civil Planning and Infrastructure Compliance • sign.conceptengineers.com.au
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-[10px] tracking-wider uppercase text-[#5C616F]">
              VPS Secure Node: Active
            </span>
            <span className="text-[#2A2D35]">|</span>
            <span className="font-mono text-[10px] tracking-wider uppercase text-emerald-500 font-bold">
              Docker Sealed
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
