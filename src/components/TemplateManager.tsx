import React from 'react';
import type { SavedTemplate } from '../types/email-editor';

interface TemplateManagerProps {
  showTemplateManager: boolean;
  setShowTemplateManager: (show: boolean) => void;
  savedTemplates: SavedTemplate[];
  currentTemplateId: string | null;
  onLoadTemplate: (template: SavedTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: SavedTemplate) => void;
  onNewTemplate: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  showTemplateManager,
  setShowTemplateManager,
  savedTemplates,
  currentTemplateId,
  onLoadTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onNewTemplate,
}) => {
  if (!showTemplateManager) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setShowTemplateManager(false)}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            Template Manager
          </h2>
          <button
            onClick={() => setShowTemplateManager(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={onNewTemplate}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            + New Template
          </button>
        </div>

        {savedTemplates.length === 0 ? (
          <div
            style={{ textAlign: "center", color: "#666", padding: "40px" }}
          >
            <p>No saved templates yet.</p>
            <p>Create and save your first template to see it here!</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor:
                    currentTemplateId === template.id ? "#f0f9ff" : "white",
                  borderColor:
                    currentTemplateId === template.id ? "#0ea5e9" : "#ddd",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                >
                  {template.name}
                </h3>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  Created:{" "}
                  {new Date(template.createdAt).toLocaleDateString()}
                </p>
                {template.base64Images && Object.keys(template.base64Images).length > 0 && (
                  <p
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "0.7rem",
                      color: "#059669",
                      fontWeight: "500",
                    }}
                  >
                    📷 {Object.keys(template.base64Images).length} base64 images
                  </p>
                )}
                <div
                  style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                >
                  <button
                    onClick={() => onLoadTemplate(template)}
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      flex: 1,
                    }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDuplicateTemplate(template)}
                    style={{
                      backgroundColor: "#f59e0b",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 