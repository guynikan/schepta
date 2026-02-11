import React from "react";

export function HomePage() {
  return (
    <div
      style={{
        padding: "2rem",
        background: "#f8f9fa",
        borderRadius: "8px",
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          color: "#61dafb",
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <h2>Bem-vindo ao Single-SPA + Vite Experiment</h2>
      </div>
      <p>Escolha um framework para ver a demonstração do Schepta:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        <a
          href="/react"
          style={{
            display: "block",
            padding: "2rem",
            background: "white",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            minWidth: "200px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#61dafb" }}>React</h3>
          <p style={{ margin: "0" }}>Demonstração com React + Material-UI</p>
        </a>
        <a
          href="/vue"
          style={{
            display: "block",
            padding: "2rem",
            background: "white",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            minWidth: "200px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#4fc08d" }}>Vue</h3>
          <p style={{ margin: "0" }}>Demonstração com Vue 3 Composition API</p>
        </a>
        <a
          href="/vanilla"
          style={{
            display: "block",
            padding: "2rem",
            background: "white",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s",
            minWidth: "200px",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#f7df1e" }}>
            Vanilla JS
          </h3>
          <p style={{ margin: "0" }}>Demonstração com JavaScript puro</p>
        </a>
      </div>
    </div>
  );
}
