import { site } from "../data/content";
import resume from "../data/resume.json";

export function CVDocument() {
  return (
    <article className="cv-document" aria-label={`${site.name} résumé`}>
      <header className="cv-document-header">
        <h1>{site.name}</h1>
        <p>{site.role} <span aria-hidden="true">·</span> Amman, Jordan</p>
        <ul className="cv-contact" aria-label="Contact details">
          <li><a href={site.phoneHref}>{site.phone}</a></li>
          <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          <li><a href={site.linkedin} target="_blank" rel="noreferrer">linkedin.com/in/saleh-almashni</a></li>
          <li><a href={site.github} target="_blank" rel="noreferrer">github.com/saleh2001k</a></li>
          <li><a href="https://salehos.com" target="_blank" rel="noreferrer">salehos.com</a></li>
        </ul>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{resume.summary}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {resume.experience.map((job) => (
          <div className="cv-job" key={job.company}>
            <div className="cv-document-row">
              <h3>{job.company}</h3>
              <span>{job.location}</span>
            </div>
            <div className="cv-document-row cv-job-role">
              <p>{job.role}</p>
              <span>{job.dates}</span>
            </div>
            <ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
          </div>
        ))}
      </section>

      <section>
        <h2>Open Source &amp; Projects</h2>
        <ul>
          {resume.projects.map((project) => (
            <li key={project.name}>
              <strong>
                {project.url ? <a href={project.url} target="_blank" rel="noreferrer">{project.name}</a> : project.name}
              </strong>: {project.description}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Skills</h2>
        <dl className="cv-skills">
          {resume.skills.map((skill) => (
            <div key={skill.label}><dt>{skill.label}:</dt> <dd>{skill.value}</dd></div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Education &amp; Certifications</h2>
        {resume.education.map((item) => (
          <div className="cv-document-row" key={item.org}>
            <p><strong>{item.org}</strong>, {item.title}</p>
            <span>{item.dates}</span>
          </div>
        ))}
        <p><strong>Certifications:</strong> {resume.certifications}</p>
      </section>
    </article>
  );
}
