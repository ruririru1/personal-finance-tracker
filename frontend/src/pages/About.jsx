export default function About() {
  return (
    <div className="container">
      <h2>About This Project</h2>

      <p>
        This web application was developed as a final project for the course
        <b> Advanced Databases (NoSQL)</b>.
      </p>

      <p>
        The goal of the project is to demonstrate practical usage of MongoDB,
        RESTful APIs, aggregation pipelines, and full-stack development.
      </p>

      <h3>Developers</h3>
      <ul>
        <li>Arailym Orynbay</li>
        <li>Alish Dyussekeyeva</li>
      </ul>

      <h3>Technologies Used</h3>
      <ul>
        <li>MongoDB</li>
        <li>Express.js</li>
        <li>React</li>
        <li>Node.js</li>
      </ul>

      <h3>Support the Developers ☕</h3>
      <p>
        If you enjoyed this project, you can support the developers with a
        symbolic donation.
      </p>

      <button
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
        onClick={() => alert("Thank you for your support! 💙")}
      >
        Donate
      </button>
    </div>
  );
}
