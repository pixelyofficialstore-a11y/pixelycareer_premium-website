/* The /ae hero visual: an HTML/CSS CV in front of a pile of weak ones. Sample content only. All sizes are in em: 1em is 1% of the sheet's width. */

const FILLER =
  "Hardworking and dedicated team player seeking a challenging position in a reputed organization where I can utilize my skills and grow with the company. Responsible for various duties and tasks as assigned by management from time to time. Good communication skills and able to work under pressure.";

const Photo = () => (
  <span className="ae-photo">
    <i />
    <b />
  </span>
);

function SkillBars() {
  return (
    <div className="ae-bars">
      {[70, 45, 85, 55, 65, 40].map((w) => (
        <span key={w}>
          <i style={{ width: `${w}%` }} />
        </span>
      ))}
    </div>
  );
}

/** Dark sidebar, photo, skill bars and a wall of small text. */
const BadSidebar = () => (
  <div className="ae-bad ae-bad-side">
    <div className="ae-side">
      <Photo />
      <p className="ae-bad-h">CONTACT</p>
      <p className="ae-bad-t">Mobile: 0000 0000000 Email: name@mail.com Address: House no 00, Street 00</p>
      <p className="ae-bad-h">MY SKILLS</p>
      <SkillBars />
      <p className="ae-bad-h">HOBBIES</p>
      <p className="ae-bad-t">Reading books, Cricket, Travelling, Internet surfing</p>
    </div>
    <div className="ae-main">
      <p className="ae-bad-name">YOUR NAME</p>
      <p className="ae-bad-box">OBJECTIVE</p>
      <p className="ae-bad-t">{FILLER}</p>
      <p className="ae-bad-box">WORK HISTORY</p>
      <p className="ae-bad-t">
        {FILLER} {FILLER}
      </p>
      <p className="ae-bad-box">REFERENCES</p>
      <p className="ae-bad-t">{FILLER}</p>
    </div>
  </div>
);

/** Centered title, photo jammed in the corner, cramped two-column body. */
const BadColumns = () => (
  <div className="ae-bad ae-bad-cols">
    <p className="ae-bad-title">CURRICULUM VITAE</p>
    <Photo />
    <div className="ae-two">
      <div>
        <p className="ae-bad-h">PERSONAL INFO</p>
        <p className="ae-bad-t">{FILLER}</p>
        <p className="ae-bad-h">EDUCATION</p>
        <p className="ae-bad-t">{FILLER}</p>
      </div>
      <div>
        <p className="ae-bad-h">CAREER OBJECTIVE</p>
        <p className="ae-bad-t">{FILLER}</p>
        <p className="ae-bad-h">KEY SKILLS</p>
        <SkillBars />
      </div>
    </div>
  </div>
);

/** Grey band, photo box, and text blocks in grey boxes: the sheet on top of the pile. */
const BadBand = () => (
  <div className="ae-bad ae-bad-band">
    <p className="ae-bad-band-top">Your Name</p>
    <div className="ae-bad-band-body">
      <div className="ae-bad-intro">
        <Photo />
        <p className="ae-bad-t">{FILLER}</p>
      </div>
      {["Job Experience", "Academic Qualification", "Computer Skills", "Declaration"].map((h) => (
        <div key={h}>
          <p className="ae-bad-box ae-bad-box-light">{h}</p>
          <p className="ae-bad-t">{FILLER}</p>
        </div>
      ))}
    </div>
  </div>
);

// Fanned angle and offset of each sheet. The last is on top and stays square to the good CV, which starts tucked behind its edge.
const SHEETS = [
  { Kind: BadColumns, a: -19, dx: -7, dy: 3 },
  { Kind: BadSidebar, a: -12, dx: -4, dy: 2 },
  { Kind: BadColumns, a: 6, dx: 4, dy: 2 },
  { Kind: BadSidebar, a: -5, dx: -2, dy: 1 },
  { Kind: BadBand, a: 0, dx: 0, dy: 0 },
];

function GoodCv({ contact }: { contact: string }) {
  return (
    <div className="ae-paper">
      <div className="ae-band">
        <div>
          <p className="ae-name">Your Name</p>
          <p className="ae-role">Your Target Role</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark-white.svg" alt="" width={64} height={86} className="ae-mark" />
        <i className="ae-pixel" />
      </div>
      <div className="ae-body">
        <p className="ae-contact">{contact}</p>
        <p className="ae-h">PROFILE</p>
        <p className="ae-t">Experienced professional who turns complex work into clear results. Known for reliable delivery, strong communication and steady ownership across teams.</p>
        <p className="ae-h">EXPERIENCE</p>
        <p className="ae-r">
          <b>Senior Role Title, Company Name</b>
          <span>20XX to Present</span>
        </p>
        <ul className="ae-ul">
          <li>Led cross-functional projects from plan to delivery</li>
          <li>Improved reporting for faster, clearer decisions</li>
          <li>Coached new team members on core processes</li>
        </ul>
        <p className="ae-r">
          <b>Role Title, Company Name</b>
          <span>20XX to 20XX</span>
        </p>
        <ul className="ae-ul">
          <li>Managed client relationships and communication</li>
          <li>Built simple workflows that reduced repeat errors</li>
        </ul>
        <p className="ae-h">SKILLS</p>
        <p className="ae-t">Project Management · Stakeholder Communication · Data Analysis · Reporting · Team Leadership · Problem Solving</p>
        <p className="ae-h">EDUCATION</p>
        <p className="ae-r">
          <b>Degree Name, University Name</b>
          <span>20XX</span>
        </p>
        <p className="ae-r">
          <b>Professional Certificate, Institute Name</b>
          <span>20XX</span>
        </p>
      </div>
    </div>
  );
}

export default function AeCvStack() {
  return (
    <div className="ae-stack" aria-hidden="true">
      <div className="ae-pile">
        {SHEETS.map(({ Kind, a, dx, dy }, i) => (
          <div key={i} className="ae-sheet" style={{ "--a": a, "--dx": dx, "--dy": dy } as React.CSSProperties}>
            <Kind />
          </div>
        ))}
      </div>
      <div className="ae-good">
        <div className="ae-good-shadow" />
        <GoodCv contact="Dubai, UAE · +971 00 000 0000 · you@email.com · Employment visa (transferable)" />
        <span className="ae-chip ae-chip-1">
          <span>ATS-Optimized</span>
        </span>
        <span className="ae-chip ae-chip-2">
          <span>Recruiter-Ready</span>
        </span>
        <span className="ae-chip ae-chip-3">
          <span>International Formats</span>
        </span>
      </div>
    </div>
  );
}
