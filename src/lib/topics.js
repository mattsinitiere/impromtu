/* Topic corpus. Format: "Field|Topic~difficulty|..."  1 beginner · 2 intermediate · 3 advanced
   To add a field, add a string. No &, < or > in topic names. Timeless subjects only. */
export const RAW = [
"Technology|Cloud Computing~1|Edge Computing~2|The Domain Name System~2|Content Delivery Networks~2|Public Key Infrastructure~3|Solid State Drives~1|RFID and NFC~1|Lithium-Ion Battery Chemistry~2|Semiconductor Lithography~3|Mesh Networking~2|Digital Rights Management~2|Wireless Charging~2|QR Codes~1|Satellite Internet Constellations~2|E-Ink Displays~1",
"Programming|Recursion~1|Big-O Notation~2|Garbage Collection~2|Version Control with Git~1|Regular Expressions~2|Functional Programming~2|Memory Leaks~2|Compilers vs Interpreters~2|Concurrency and Parallelism~3|Immutable Data Structures~3|Dependency Injection~2|Technical Debt~1|Test-Driven Development~2|Type Systems~3|Race Conditions~3|API Rate Limiting~2",
"Web Development|CSS Grid~2|The Box Model~1|Progressive Enhancement~2|Server-Side Rendering~2|Web Accessibility Standards~2|HTTP Caching~2|Cross-Origin Resource Sharing~3|WebAssembly~3|Responsive Typography~2|Core Web Vitals~2|Single Page Applications~1|Cookies and Sessions~1|Service Workers~3",
"Artificial Intelligence|Neural Networks~2|Transformer Architecture~3|Reinforcement Learning~3|Hallucination in Language Models~2|The Turing Test~1|Expert Systems~2|Computer Vision~2|Speech Recognition~2|The Alignment Problem~3|Tokenization~2|Synthetic Training Data~2|Explainable AI~3|Recommendation Engines~1",
"Machine Learning|Overfitting~2|Gradient Descent~3|Decision Trees~2|Clustering~2|Feature Engineering~3|Training and Test Splits~1|The Bias-Variance Tradeoff~3|Ensemble Methods~3|Transfer Learning~3|Embeddings~3|Precision and Recall~2|Data Leakage~3",
"Cybersecurity|Phishing~1|Zero-Day Vulnerabilities~2|Public Key Cryptography~3|Two-Factor Authentication~1|Ransomware~1|SQL Injection~2|Zero Trust Architecture~3|Social Engineering~1|Password Hashing and Salting~2|Denial of Service Attacks~2|The CIA Triad~2|Supply Chain Attacks~3|Penetration Testing~2",
"Business|Economies of Scale~1|Vertical Integration~2|Switching Costs~1|Network Effects~2|The Innovator's Dilemma~3|Unit Economics~2|Blue Ocean Strategy~2|Franchising~1|Two-Sided Marketplaces~2|Moats and Competitive Advantage~2|Product-Market Fit~2|The BCG Growth-Share Matrix~2|Loss Leaders~1",
"Marketing|Brand Positioning~1|Customer Lifetime Value~2|The Marketing Funnel~1|A/B Testing~2|Market Segmentation~1|Word of Mouth Dynamics~2|Attribution Modelling~3|Price Anchoring~2|Category Design~3|Direct Response Copywriting~2|Retention vs Acquisition~2|Brand Equity~2",
"Psychology|Survivorship Bias~1|The Dunning-Kruger Effect~1|Confirmation Bias~1|Cognitive Dissonance~2|Operant Conditioning~2|The Bystander Effect~1|Flow States~1|Attachment Theory~2|Learned Helplessness~2|The Availability Heuristic~2|Working Memory~2|The Spacing Effect~2|Fundamental Attribution Error~2|Loss Aversion~2|Priming~3|Cognitive Load Theory~2",
"Behavioural Economics|Nudge Theory~2|The Sunk Cost Fallacy~1|Hyperbolic Discounting~3|Prospect Theory~3|Default Effects~2|The Endowment Effect~2|Choice Overload~1|Mental Accounting~2|Social Proof~1|Framing Effects~2",
"Economics|Supply and Demand~1|Opportunity Cost~1|Inflation~1|Comparative Advantage~2|Externalities~2|The Tragedy of the Commons~2|Moral Hazard~2|Elasticity of Demand~2|Quantitative Easing~3|The Gini Coefficient~2|Purchasing Power Parity~3|Creative Destruction~2|Public Goods~2|Stagflation~3",
"Finance|Compound Interest~1|Bond Yields~2|The Time Value of Money~2|Leverage~2|Liquidity~2|Credit Ratings~2|Derivatives~3|Discounted Cash Flow~3|Fractional Reserve Banking~2|Foreign Exchange Markets~3|Insurance Underwriting~2|Securitization~3",
"Investing|Diversification~1|Index Funds~1|Dollar-Cost Averaging~1|The Efficient Market Hypothesis~3|Value vs Growth Investing~2|Short Selling~2|Venture Capital Power Laws~3|Portfolio Rebalancing~2|Risk-Adjusted Return~3|Dividend Policy~2",
"Accounting|Double-Entry Bookkeeping~2|Accrual vs Cash Accounting~2|Depreciation~2|Working Capital~2|The Balance Sheet~1|EBITDA~2|Revenue Recognition~3|Internal Controls~2",
"History|The Silk Road~1|Ancient Rome~1|The Printing Press~1|The Bronze Age Collapse~2|The Marshall Plan~2|Feudalism~2|The Meiji Restoration~2|The Hanseatic League~3|The Columbian Exchange~2|The Berlin Airlift~2|The Library of Alexandria~1|Bretton Woods~3|The Enclosure Movement~3|The 1918 Influenza Pandemic~1",
"Military History|Blitzkrieg~2|Trench Warfare~1|The Siege of Constantinople~2|Naval Blockades~2|Guerrilla Warfare~2|Logistics in the Second World War~2|The Longbow at Agincourt~1|Mutually Assured Destruction~2|Codebreaking at Bletchley Park~2|Fortification Design~3",
"Science|The Scientific Method~1|Peer Review~1|Entropy~2|Catalysis~2|The Placebo Effect~1|Reproducibility in Research~2|Occam's Razor~1|Emergence~3|Isotopes~2|Half-Life~2|Systems Thinking~2",
"Physics|Special Relativity~3|Quantum Entanglement~3|Thermodynamics~2|Superconductivity~3|Wave-Particle Duality~3|Friction~1|Resonance~2|The Doppler Effect~1|Nuclear Fusion~2|Fluid Dynamics~3|The Standard Model~3|Terminal Velocity~1|Electromagnetism~2",
"Chemistry|The Periodic Table~1|pH and Acidity~1|Polymers~2|Chemical Bonding~2|Chromatography~2|Combustion~1|The Haber-Bosch Process~3|Stereochemistry~3|Electrolysis~2|Solubility~1",
"Biology|CRISPR~2|Photosynthesis~1|Natural Selection~1|The Human Microbiome~2|Mitochondria~2|Epigenetics~3|Apoptosis~3|Symbiosis~1|Enzymes~2|Antibiotic Resistance~2|Convergent Evolution~2|Cell Signalling~3|Keystone Species~2",
"Medicine|Vaccination~1|Randomised Controlled Trials~2|Antibiotics~1|The Blood-Brain Barrier~3|Triage~1|Anaesthesia~2|Organ Transplant Rejection~3|Sensitivity and Specificity~3|Palliative Care~2|Herd Immunity~2|Medical Imaging~2",
"Neuroscience|Neuroplasticity~2|The Default Mode Network~3|Memory Consolidation~2|Neurotransmitters~2|Functional MRI~3|Circadian Rhythms~1|Mirror Neurons~2|Pain Perception~2",
"Astronomy|Black Holes~2|Dark Matter~2|The Cosmic Microwave Background~3|Exoplanet Detection~2|Stellar Nucleosynthesis~3|Orbital Mechanics~2|Redshift~2|The Habitable Zone~1|Gravitational Lensing~3|Comets and Asteroids~1|The Fermi Paradox~2",
"Space Exploration|Space Elevators~2|The Apollo Guidance Computer~2|Ion Propulsion~3|Reusable Rockets~1|Orbital Debris~2|Closed-Loop Life Support~3|Gravity Assists~3|The International Space Station~1|Entry, Descent and Landing~3",
"Mathematics|Bayes' Theorem~3|Prime Numbers~1|The Golden Ratio~1|Exponential Growth~1|Set Theory~2|Graph Theory~2|Calculus~2|Topology~3|Godel's Incompleteness Theorems~3|Fractals~2|Modular Arithmetic~2|Linear Algebra~3|Game Theory~2",
"Statistics|Correlation vs Causation~1|Standard Deviation~1|Statistical Significance~2|Sampling Bias~2|Regression to the Mean~2|Confidence Intervals~2|The Central Limit Theorem~3|Simpson's Paradox~3|P-Hacking~3|Monte Carlo Simulation~3",
"Logic|Deductive vs Inductive Reasoning~1|Logical Fallacies~1|The Burden of Proof~1|Necessary and Sufficient Conditions~2|Formal Proof~3|Paradoxes~2|First-Order Logic~3|Falsifiability~2",
"Philosophy|The Trolley Problem~1|Stoicism~1|Epistemology~2|Utilitarianism~2|The Ship of Theseus~1|Determinism and Free Will~2|Platos Cave~1|The Categorical Imperative~3|Existentialism~2|The Hard Problem of Consciousness~3|Nihilism~2|Pragmatism~3|The Socratic Method~1|Dialectics~3|Absurdism~2|Philosophical Skepticism~2|Empiricism and Rationalism~2|Phenomenology~3|The Problem of Induction~3|Moral Relativism~2|Virtue Ethics~2|The Is-Ought Problem~3|Solipsism~2|Teleology~3|Cynicism~2|Epicureanism~1|Transcendental Idealism~3|The Myth of Sisyphus~1|Thought Experiments~1|Hedonism~1|The Examined Life~1|Stoic Amor Fati~2",
"Ethics|Informed Consent~1|The Veil of Ignorance~3|Whistleblowing~1|Animal Welfare Ethics~2|Data Privacy Ethics~2|Triage Ethics~2|Conflicts of Interest~1|Effective Altruism~2|Dual-Use Research~3",
"Politics|Separation of Powers~1|Proportional Representation~2|Gerrymandering~2|Federalism~2|Soft Power~2|The Filibuster~2|Coalition Governments~2|Referendums~1|Economic Sanctions~2|Non-Alignment~3",
"Law|Habeas Corpus~2|Precedent and Stare Decisis~2|Intellectual Property~1|Due Process~2|Contract Consideration~2|Common Law vs Civil Law~2|Fair Use~2|Liability and Negligence~2|Jurisdiction~2|Antitrust Law~3",
"Geography|Plate Tectonics~1|Ocean Currents~2|Monsoons~1|Desertification~2|River Deltas~1|Map Projections~2|Time Zones~1|Watersheds~2|Permafrost~2|Karst Landscapes~3",
"Climate|The Greenhouse Effect~1|Carbon Sinks~2|El Nino and La Nina~2|Ice Cores as Climate Records~3|Climate Feedback Loops~3|Sea Level Rise~2|Albedo~2|Carbon Pricing~2|Ocean Acidification~2",
"Renewable Energy|Photovoltaic Cells~2|Wind Turbine Design~2|Grid-Scale Storage~2|Geothermal Energy~2|Hydroelectric Power~1|Base Load and Peak Demand~2|Green Hydrogen~3|Tidal Power~2|Net Metering~2",
"Engineering|Tolerance and Fit~2|Failure Modes and Effects Analysis~3|Redundancy in Safety Systems~2|Cantilevers~2|Load-Bearing Structures~1|Control Systems~3|Reverse Engineering~1|Finite Element Analysis~3|Vibration Damping~3",
"Materials Science|Composites~2|Alloys~1|Carbon Fibre~1|Fatigue Failure~2|Shape Memory Alloys~3|Engineering Ceramics~2|Corrosion~1|Self-Healing Materials~3|Crystal Structure~3",
"Manufacturing|Lean Manufacturing~2|Just-in-Time Inventory~2|Injection Moulding~1|Six Sigma~2|Additive Manufacturing~1|Statistical Process Control~3|Tooling and Jigs~2|The Assembly Line~1|Design for Manufacture~2",
"Supply Chain|The Bullwhip Effect~2|Cold Chain Logistics~2|Containerisation~1|Last Mile Delivery~1|Demand Forecasting~2|Single-Source Risk~2|Freight Consolidation~2|Reshoring~2",
"Transportation|Electric Vehicles~1|High-Speed Rail~1|Air Traffic Control~2|Roundabouts vs Signals~1|Levels of Vehicle Autonomy~2|Container Shipping Economics~2|Induced Demand~2|Regenerative Braking~2|How Wings Generate Lift~1",
"Urban Planning|Zoning~1|Mixed-Use Development~1|Transit-Oriented Development~2|Urban Heat Islands~2|The 15-Minute City~1|Setbacks and Density~2|Gentrification~2|Floor Area Ratio~2|Walkability~1|Land Value Capture~3",
"Architecture|Japanese Architecture~1|Brutalism~1|Load Paths~2|Passive Solar Design~2|Proportion Systems in Building~2|Vernacular Architecture~2|Adaptive Reuse~1|Curtain Wall Systems~3|Acoustic Design~2|The Bauhaus~1",
"UX Design|Design Systems~2|Affordances~1|Progressive Disclosure~2|Fitts's Law~2|Usability Testing~1|Information Architecture~2|Cognitive Load in Interfaces~2|Contrast and Legibility~2|Dark Patterns~1|Jobs to Be Done~2",
"Graphic Design|Typography~1|Colour Theory~1|Grid Systems~2|Visual Hierarchy~1|Kerning and Tracking~2|Negative Space~1|Logo Design Principles~1|Print vs Screen Colour~2|Swiss Style~2",
"Photography|Sony Mirrorless Cameras~1|Depth of Field~1|The Exposure Triangle~1|Focal Length and Compression~2|Dynamic Range~2|The Rule of Thirds~1|Colour Grading~2|Sensor Size~2|Flash Sync Speed~3|Photojournalism Composition~2",
"Film|Continuity Editing~2|Three-Act Structure~1|Diegetic Sound~2|The Long Take~2|The Kuleshov Effect~2|Colour in Cinematography~2|Practical vs Digital Effects~1|Film Scoring~2",
"Writing|The Inverted Pyramid~1|Show, Don't Tell~1|Narrative Structure~2|Editing for Concision~1|Voice and Register~2|The Hero's Journey~1|Technical Writing Standards~2|Rhetorical Devices~2",
"Communication|Active Listening~1|Nonviolent Communication~2|The Curse of Knowledge~2|Feedback Models~1|Negotiation Anchoring~2|Reading a Room~2|Written vs Synchronous Communication~1|Crisis Communication~2",
"Public Speaking|Vocal Projection~1|Pacing and Pause~1|Structuring a Talk~1|Handling Hostile Questions~2|Stage Presence~1|Rhetoric in Political Speech~2|Storytelling in Presentations~1|Impromptu Speaking Frameworks~2",
"Leadership|Delegation~1|Psychological Safety~2|Servant Leadership~2|Span of Control~2|Succession Planning~2|Managing Up~1|Decision Rights~2|Organisational Culture~2|Conway's Law~3",
"Productivity|Parkinson's Law~1|The Eisenhower Matrix~1|Deep Work~1|Context Switching Costs~2|The Pomodoro Technique~1|Time Blocking~1|The Theory of Constraints~3|Batching~1|The Zeigarnik Effect~2",
"Innovation|Diffusion of Innovations~2|The Adjacent Possible~3|Skunkworks Teams~2|Patents and Prior Art~2|Prototyping~1|Lead User Innovation~3|Standards Wars~2|Technology S-Curves~3",
"Entrepreneurship|Bootstrapping~1|Minimum Viable Product~1|Founder Equity Splits~2|Burn Rate and Runway~2|Pivoting~1|Customer Discovery~2|Cap Tables~3|Pricing Strategy~2",
"Anthropology|Kinship Systems~2|Ritual and Social Cohesion~2|Material Culture~2|Participant Observation~2|Oral Tradition~1|Cultural Relativism~2|The Neolithic Revolution~1|Gift Economies~2",
"Religion|Monotheism~1|Pilgrimage~1|Religious Syncretism~3|Sacred Architecture~2|The Reformation~2|Buddhist Philosophy~2|Religious Law~3|Iconography~2|Polytheism~1|Animism~2|Ritual Sacrifice~2|Prophecy~2|Monasticism~2|Asceticism~2|Sacred Texts and Canon~2|Prayer~1|Fasting Traditions~1|The Sabbath~1|Religious Conversion~2|Secularisation~2|Theocracy~2|Religious Tolerance~2|Heresy~2|Schism~2|Eschatology~3|Beliefs About the Afterlife~2|Sainthood~2|Sacred Music~2|Dietary Laws~1|Sacred Time and Festivals~2|Relics~2|Blasphemy Laws~3",
"Languages|The International Phonetic Alphabet~2|Language Families~2|Loanwords~1|Grammatical Gender~2|Writing Systems~2|Code-Switching~2|Language Death~2|Linguistic Relativity~3|Sign Languages~1",
"Nutrition|Macronutrients~1|The Glycemic Index~2|Dietary Fibre~1|Food Fortification~2|Protein and Diet~2|Food Preservation~1|Micronutrient Deficiency~2|Ultra-Processed Foods~1",
"Fitness|Progressive Overload~1|VO2 Max~2|Recovery and Supercompensation~2|Mobility vs Flexibility~1|Zone 2 Training~2|Muscle Hypertrophy~2|Periodisation~3",
"Sports Science|The Biomechanics of Sprinting~2|Lactate Threshold~3|Altitude Training~2|Injury Prevention Screening~2|Nutrient Timing~2|Reaction Time~1|Home Field Advantage~1",
"Agriculture|Crop Rotation~1|Irrigation Systems~1|Soil Health~1|Precision Agriculture~2|Genetically Modified Crops~2|Vertical Farming~1|Pollination~1|Grazing Management~2",
"Learning|Memory Palaces~1|Spaced Repetition~1|Active Recall~1|The Feynman Technique~1|Interleaving~2|Desirable Difficulty~3|Deliberate Practice~2|Transfer of Learning~3|Metacognition~2",
"Information Theory|Data Compression~2|Signal-to-Noise Ratio~2|Error Correcting Codes~3|Shannon Entropy~3|Bandwidth vs Latency~2|Checksums~2|Character Encoding~2",
"Theology|The Problem of Evil~2|Theodicy~3|Arguments for the Existence of God~2|The Ontological Argument~3|Grace and Works~3|The Trinity~3|Predestination~3|Natural Theology~3|Apophatic Theology~3|Divine Revelation~2|Covenant~2|The Incarnation~3|Original Sin~2|Divine Hiddenness~3",
"Comparative Religion|The Abrahamic Faiths~1|Hinduism~1|Buddhism~1|Judaism~1|Christianity~1|Islam~1|Sikhism~1|Jainism~2|Shinto~2|Zoroastrianism~2|The Bahai Faith~2|Indigenous Spiritualities~2|Folk Religion~2|Sunni and Shia Islam~2|Catholic and Orthodox Christianity~2",
"Religious History|The Council of Nicaea~2|The Crusades~1|The Great Schism~2|The Early Spread of Islam~2|The Dead Sea Scrolls~2|Monastic Scriptoria~2|The Inquisition~2|Missionary Movements~2|The Second Vatican Council~3|The European Wars of Religion~2|The Bhakti Movement~3|The Rise of Protestantism~2|Buddhism Along the Silk Road~3",
"Eastern Philosophy|Confucianism~2|Taoism~2|Wu Wei~2|The Four Noble Truths~1|Karma~1|Advaita Vedanta~3|Zen Koans~2|Bushido~1|Chinese Legalism~3|Mohism~3|The Bhagavad Gita~2|Impermanence~1|The Eightfold Path~2|Mindfulness~1",
"Political Philosophy|Social Contract Theory~2|Liberalism~2|Conservatism~2|Anarchism~2|Marxism~2|Republicanism~3|Distributive Justice~3|Negative and Positive Liberty~3|The Harm Principle~2|Political Legitimacy~3|Communitarianism~3|Civil Disobedience~1|The Tyranny of the Majority~2|Natural Rights~2",
"Philosophy of Mind|Dualism~2|Functionalism~3|Qualia~3|The Chinese Room~2|Panpsychism~3|The Extended Mind~3|Personal Identity~2|Intentionality~3|Philosophical Zombies~3|Theory of Mind~2|Eliminative Materialism~3|Embodied Cognition~3",
"Philosophy of Science|Paradigm Shifts~2|The Demarcation Problem~3|Scientific Realism~3|Underdetermination~3|Instrumentalism~3|The Duhem-Quine Thesis~3|Models and Idealisation~3|Causation in Science~3|The Replication Crisis~2|Reductionism~2|Natural Kinds~3|Theory-Laden Observation~3",
"Metaphysics|Ontology~3|Universals and Particulars~3|Possible Worlds~3|Substance~3|Presentism and Eternalism~3|Causality~2|Identity Over Time~2|Mereology~3|Essence and Accident~3|Nothingness~2",
"Aesthetics|The Sublime~2|Beauty and Taste~2|Artistic Intention~2|Formalism in Art~3|The Aura of the Original~3|Kitsch~2|Catharsis~2|Aesthetic Judgement~3|The Uncanny~2",
"Mythology|Creation Myths~1|The Hero Myth~1|Norse Mythology~1|Greek Mythology~1|Egyptian Mythology~1|Trickster Figures~2|Flood Narratives~2|Underworld Myths~2|Mesopotamian Myth~2|Founding Myths of Nations~2",
"Computer Science|Turing Machines~3|P versus NP~3|Hashing~2|Sorting Algorithms~2|Data Structures~2|Finite State Machines~2|Cryptographic Hash Functions~3|Virtual Memory~3|Process Scheduling~3|Pointers and References~2|Abstraction Layers~1|Instruction Sets~3",
"Distributed Systems|Blockchain~1|Consensus Mechanisms~3|Smart Contracts~2|The CAP Theorem~3|Eventual Consistency~3|Sharding~3|Byzantine Fault Tolerance~3|Idempotency~2|Message Queues~2|Load Balancing~2|Replication Lag~3",
"Quantum Computing|Qubits~2|Quantum Superposition~2|Quantum Gates~3|Shors Algorithm~3|Quantum Error Correction~3|Decoherence~3|Post-Quantum Cryptography~3|Quantum Annealing~3",
"Data Engineering|ETL Pipelines~2|Data Warehousing~2|Schema Design~2|Database Normalisation~2|Database Indexing~2|Streaming versus Batch~3|Data Lineage~3|Slowly Changing Dimensions~3|Idempotent Ingestion~3|Data Governance~2",
"Robotics|Degrees of Freedom~2|Actuators~2|Simultaneous Localisation and Mapping~3|Inverse Kinematics~3|Sensor Fusion~3|Path Planning~3|End Effectors~2|Human-Robot Interaction~2|Servo Control~2",
"Aviation|How Jet Engines Work~1|Airfoils~2|The Flight Envelope~3|Instrument Flight Rules~2|Aircraft Separation~2|Aircraft Certification~3|Crew Resource Management~2|Hub and Spoke Networks~1|Fly-by-Wire~2|Aerodynamic Stall~2|Pressurised Cabins~1|Wake Turbulence~2",
"Sociology|Social Capital~2|Norms and Deviance~2|Bureaucracy~2|Social Stratification~2|Moral Panic~2|Collective Action Problems~3|The Strength of Weak Ties~2|Institutions~2|Anomie~3|Socialisation~1|Status Hierarchies~2|Social Contagion~3",
"Education|Blooms Taxonomy~2|The Socratic Seminar~2|Standardised Testing~1|The Montessori Method~1|Curriculum Design~2|Formative Assessment~2|The Achievement Gap~2|Apprenticeship Models~1|Class Size Effects~2|Literacy Instruction~2|Homework Effectiveness~2",
"Journalism|The Fourth Estate~2|Fact-Checking~1|Source Protection~2|Editorial Independence~2|Objectivity in Reporting~2|The News Cycle~1|Investigative Method~2|Media Ownership~2|Embedded Reporting~2",
"Music Theory|Harmony~2|Rhythm and Metre~1|Scales and Modes~2|Counterpoint~3|Chord Progressions~2|Timbre~2|Musical Form~2|Tuning Systems~3|Improvisation~2|Musical Notation~1|Syncopation~2",
"Art History|Renaissance Perspective~2|Impressionism~1|Cubism~2|The Baroque~2|Ukiyo-e~2|Modernism~2|Artistic Patronage~2|Iconoclasm~3|Still Life~1|The Avant-Garde~2",
"Culinary Science|The Maillard Reaction~1|Emulsions~2|Fermentation~1|Braising and Roasting~1|Salt and Seasoning~1|Sourdough~1|Knife Skills~1|Umami~1|Sous Vide~2|Baking Chemistry~2|Stock and Reduction~1",
"Game Design|Core Loops~1|Difficulty Curves~1|Emergent Gameplay~2|Player Agency~2|Randomness and Skill~2|Level Design~2|Progression Systems~1|Playtesting~2|Asymmetric Balance~3|Feedback and Game Feel~2",
"Real Estate|Capitalisation Rates~2|Net Operating Income~2|Highest and Best Use~2|Ground Leases~3|Tenant Improvement Allowances~2|Absorption Rates~2|Title and Easements~2|Development Pro Formas~3|Triple Net Leases~2|Entitlements~2|Rent Rolls~1|Cost Segregation~3",
"Construction|The Critical Path Method~2|Change Orders~1|Punch Lists~1|Value Engineering~2|Building Codes~2|Concrete Curing~2|Prefabrication~2|Site Logistics~2|Retainage~2|Substantial Completion~2",
"Project Management|Scope Creep~1|Work Breakdown Structures~2|Stage Gates~2|Risk Registers~2|Earned Value Management~3|Agile and Waterfall~1|Dependencies and Slack~2|Stakeholder Mapping~2|Definition of Done~2",
"Human Resources|Compensation Bands~2|Performance Reviews~1|Onboarding Design~1|Hiring Signals~2|Cost of Turnover~2|Job Architecture~3|Structured Interviews~2|Exit Interviews~1",
"Sales|Consultative Selling~1|Objection Handling~1|Pipeline Management~2|Discovery Questions~2|Buying Committees~2|Discounting Discipline~2|Referral Selling~1|Qualification Frameworks~2",
"Negotiation|BATNA~2|Concession Patterns~2|Integrative and Distributive Bargaining~3|Reservation Price~2|Multi-Issue Trades~3|Silence as Leverage~1|Mediation~2|Walking Away~1",
"Public Health|Epidemic Curves~2|Contact Tracing~1|Screening Programmes~2|Health Inequality~2|Vector Control~2|Sanitation~1|Vaccine Hesitancy~2|Population Pyramids~2|Notifiable Diseases~2",
"Genetics|DNA Replication~2|Mendelian Inheritance~1|Gene Expression~2|Mutation~1|Polygenic Traits~3|Genetic Drift~2|Heritability~3|Genome Sequencing~2|Recessive and Dominant Alleles~1",
"Ecology|Trophic Cascades~2|Carrying Capacity~2|Ecological Succession~2|Biodiversity~1|Invasive Species~1|Nutrient Cycles~2|Habitat Fragmentation~2|Rewilding~2|Edge Effects~3",
"Geology|The Rock Cycle~1|Earthquakes~1|Volcanism~1|Stratigraphy~2|Radiometric Dating~3|Mineral Formation~2|Erosion~1|Aquifers~2|Fault Lines~2",
"Meteorology|Cloud Formation~1|Fronts and Air Masses~2|Hurricanes~1|The Jet Stream~2|Atmospheric Pressure~1|Weather Modelling~3|Tornado Formation~2|Dew Point~2|Lightning~1",
"Oceanography|Thermohaline Circulation~3|Tides~1|Coral Reefs~1|The Deep Sea~2|Marine Food Webs~2|Sea Ice~2|Upwelling~3|Ocean Trenches~2",
"Archaeology|Stratigraphic Excavation~2|Radiocarbon Dating~1|Grave Goods~2|Experimental Archaeology~2|LiDAR Survey~2|Provenance and Looting~2|Pottery Typology~3|Shipwreck Archaeology~2",
"Palaeontology|Fossilisation~1|Mass Extinctions~1|Dinosaur Taxonomy~2|Trace Fossils~2|Transitional Forms~2|The Cambrian Explosion~2|Amber Preservation~2",
"International Relations|The Balance of Power~2|Deterrence Theory~3|Sovereignty~2|Treaties and Ratification~2|Diplomatic Immunity~1|International Courts~2|Military Alliances~2|Realism and Liberalism~3|Failed States~2",
"Public Policy|Cost-Benefit Analysis~2|Regulatory Capture~3|Policy Windows~3|Means Testing~2|Subsidies~2|Pilot Programmes~2|Unintended Consequences~1|Evidence-Based Policy~2",
"Taxation|Progressive Taxation~1|Value Added Tax~2|Tax Incidence~3|Capital Gains~1|Transfer Pricing~3|Tax Havens~2|Withholding~1|Tax Credits and Deductions~1",
"Insurance|Risk Pooling~2|Actuarial Tables~2|Adverse Selection~3|Reinsurance~3|Deductibles and Premiums~1|Claims Adjustment~2|Catastrophe Modelling~3",
"Energy|The Electric Grid~1|Nuclear Fission~2|Peaking Power Plants~2|Transmission Losses~2|Energy Density~2|Carbon Capture~2|Battery Recycling~2|Demand Response~2",
"Economic History|The Industrial Revolution~1|The Great Depression~1|Weimar Hyperinflation~2|The Gold Standard~2|Tulip Mania~1|The East India Company~2|Post-War Japanese Growth~3|Structural Adjustment~3|The Marshall Aid Economy~3",
"Industrial Design|Ergonomics~1|Form Follows Function~1|Material Selection~2|Design for Disassembly~2|Draft Angles~3|Colour Material Finish~2|Universal Design~2|Product Lifecycles~2",
"Cultures|Hofstedes Dimensions~2|High and Low Context Cultures~2|Honour Cultures~3|Rites of Passage~1|Hospitality Traditions~1|Naming Conventions~2|Etiquette Across Cultures~1|Diaspora~2|Tea Ceremonies~1",
"Sleep Science|Sleep Cycles~1|REM Sleep~1|Sleep Debt~1|Chronotypes~2|Insomnia~2|Napping~1|Blue Light and Melatonin~2|Sleep Apnoea~2"
];

export const CATS = RAW.map((row) => {
  const p = row.split("|");
  return {
    name: p[0],
    items: p.slice(1).map((s) => {
      const b = s.split("~");
      return { t: b[0], d: parseInt(b[1], 10), c: p[0] };
    }),
  };
});

export const FLAT = CATS.reduce((a, c) => a.concat(c.items), []);
export const LEVEL = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };

export function findTopic(name) {
  return FLAT.find((x) => x.t === name) || null;
}

export function poolFor(diff, cats) {
  return FLAT.filter((x) => {
    if (diff && x.d !== diff) return false;
    if (cats && cats.length && cats.indexOf(x.c) === -1) return false;
    return true;
  });
}

export function pickTopic(diff, cats, recentTitles) {
  const p = poolFor(diff, cats);
  if (!p.length) return null;
  const fresh = p.filter((x) => recentTitles.indexOf(x.t) === -1);
  const src = fresh.length ? fresh : p;
  return src[Math.floor(Math.random() * src.length)];
}

export function dailyTopic(date) {
  const d = date || new Date();
  const key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  return FLAT[hash(key) % FLAT.length];
}

export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

export const CHECKS = [
  "Find a definition plain enough to say out loud",
  "Find out who needed this, and why it exists",
  "Find one concrete example you can picture",
  "Find a limit — where it fails, or what people get wrong",
  "Close every tab and write from memory",
];

export const ANGLES = [
  "What problem does this solve that nothing else did?",
  "Say it to a twelve-year-old in two sentences.",
  "What is the most common misunderstanding?",
  "Where does it stop working?",
  "What would be different if it did not exist?",
  "Who disagrees about it, and on what grounds?",
  "One number, date or name worth remembering.",
  "What does it resemble that you already understand?",
  "What is the strongest objection to it?",
  "How would you know if you were wrong about it?",
];
