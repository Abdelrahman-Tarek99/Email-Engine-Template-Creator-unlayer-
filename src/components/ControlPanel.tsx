import React from 'react';
import type { SavedTemplate } from '../types/email-editor';

interface ControlPanelProps {
  savedTemplates: SavedTemplate[];
  setShowTemplateManager: (show: boolean) => void;
  templateName: string;
  setTemplateName: (name: string) => void;
  currentTemplateId: string | null;
  fromEmail: string;
  setFromEmail: (email: string) => void;
  testEmails: string;
  setTestEmails: (emails: string) => void;
  isLoading: boolean;
  onSaveTemplate: () => void;
  onSendTest: () => void;
  exportHtmlWithBase64: () => Promise<{ html: string; design: Record<string, unknown> } | null>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  savedTemplates,
  setShowTemplateManager,
  templateName,
  setTemplateName,
  currentTemplateId,
  fromEmail,
  setFromEmail,
  testEmails,
  setTestEmails,
  isLoading,
  onSaveTemplate,
  onSendTest,
}) => {
  return (
    <div
      style={{
        width: "320px",
        minWidth: "320px",
        maxWidth: "320px",
        borderLeft: "1px solid #ddd",
        padding: "1.5rem",
        background: "#f9f9f9",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Template Management Section */}
      <div
        style={{
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>
          Template Management
        </h2>

        <button
          onClick={() => setShowTemplateManager(true)}
          style={{
            backgroundColor: "#8b5cf6",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            width: "100%",
            marginBottom: "12px",
          }}
        >
          📁 Manage Templates ({savedTemplates.length})
        </button>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            Template Name
          </label>
          <input
            type="text"
            placeholder="Enter template name..."
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={onSaveTemplate}
          style={{
            backgroundColor: "#16a34a",
            color: "#fff",
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            width: "100%",
          }}
        >
          {currentTemplateId ? "Update Template" : "💾 Save with Base64 Images"}
        </button>

        {currentTemplateId && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#e0f2fe",
              borderRadius: "4px",
              fontSize: "0.8rem",
              color: "#0369a1",
            }}
          >
            Currently editing: <strong>{templateName || "Untitled"}</strong>
          </div>
        )}
      </div>

      {/* Test Email Section */}
      <div>
        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.2rem" }}>
          Test Your Email
        </h2>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            From Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            To Email Addresses
          </label>
          <textarea
            placeholder="test1@example.com, test2@example.com"
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <small style={{ color: "#666", fontSize: "0.8rem" }}>
            Separate multiple emails with commas
          </small>
        </div>

        <button
          onClick={onSendTest}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#94a3b8" : "#2563eb",
            color: "#fff",
            padding: "12px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "background-color 0.2s",
            width: "100%",
          }}
        >
          {isLoading ? "Sending..." : "Send Test Email"}
        </button>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "#e0f2fe",
            borderRadius: "4px",
            fontSize: "0.8rem",
            color: "#0369a1",
          }}
        >
          <strong>Note:</strong> You need to implement the{" "}
          <code>/api/send-test-email</code> endpoint on your backend to
          actually send emails.
        </div>
      </div>
    </div>
  );
}; 