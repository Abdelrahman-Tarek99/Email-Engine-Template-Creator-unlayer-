// src/components/EmailEditor.tsx
import React, { useRef, useState, useEffect } from "react";
import EmailEditor, { type EditorRef } from "react-email-editor";

interface SavedTemplate {
  id: string;
  name: string;
  design: any;
  createdAt: string;
  thumbnail?: string;
}

const MyEmailEditor: React.FC = () => {
  const editorRef = useRef<EditorRef>(null);
  const [fromEmail, setFromEmail] = useState("");
  const [testEmails, setTestEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null
  );

  // Load saved templates from localStorage on component mount
  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = () => {
    const saved = localStorage.getItem("saved_email_templates");
    if (saved) {
      try {
        const templates = JSON.parse(saved);
        setSavedTemplates(templates);
      } catch (error) {
        console.error("Error loading saved templates:", error);
      }
    }
  };

  const saveTemplatesToStorage = (templates: SavedTemplate[]) => {
    localStorage.setItem("saved_email_templates", JSON.stringify(templates));
    setSavedTemplates(templates);
  };

  const handleSendTest = async () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    if (!fromEmail || !testEmails) {
      alert("Please fill in both From and To email addresses");
      return;
    }

    setIsLoading(true);

    editor.exportHtml(async (data) => {
      const html = data.html;

      console.log("Sending test email:");
      console.log("From:", fromEmail);
      console.log("To:", testEmails);
      console.log("HTML:", html);

      try {
        const response = await fetch("/api/send-test-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: testEmails.split(",").map((email) => email.trim()),
            html: html,
            subject: "Test Email from Email Editor",
          }),
        });

        if (response.ok) {
          alert("Test email sent successfully!");
        } else {
          alert("Failed to send test email. Please check your API endpoint.");
        }
      } catch (error) {
        console.error("Error sending test email:", error);
        alert(
          "Error sending test email. Make sure your API endpoint is set up."
        );
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSaveTemplate = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const name = templateName.trim() || `Template ${Date.now()}`;

    editor.saveDesign((design) => {
      const newTemplate: SavedTemplate = {
        id: currentTemplateId || `template_${Date.now()}`,
        name: name,
        design: design,
        createdAt: new Date().toISOString(),
      };

      let updatedTemplates;
      if (currentTemplateId) {
        // Update existing template
        updatedTemplates = savedTemplates.map((template) =>
          template.id === currentTemplateId ? newTemplate : template
        );
      } else {
        // Add new template
        updatedTemplates = [...savedTemplates, newTemplate];
      }

      saveTemplatesToStorage(updatedTemplates);
      setTemplateName("");
      setCurrentTemplateId(null);
      alert(`Template "${name}" saved successfully!`);
    });
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    editor.loadDesign(template.design);
    setCurrentTemplateId(template.id);
    setTemplateName(template.name);
    setShowTemplateManager(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      const updatedTemplates = savedTemplates.filter(
        (t) => t.id !== templateId
      );
      saveTemplatesToStorage(updatedTemplates);

      // If we're currently editing the deleted template, reset
      if (currentTemplateId === templateId) {
        setCurrentTemplateId(null);
        setTemplateName("");
      }
    }
  };

  const handleNewTemplate = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    if (confirm("Create a new template? Any unsaved changes will be lost.")) {
      editor.loadBlank();
      setCurrentTemplateId(null);
      setTemplateName("");
      setShowTemplateManager(false);
    }
  };

  const handleDuplicateTemplate = (template: SavedTemplate) => {
    const newTemplate: SavedTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...savedTemplates, newTemplate];
    saveTemplatesToStorage(updatedTemplates);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Template Manager Modal */}
      {showTemplateManager && (
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
                onClick={handleNewTemplate}
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
                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      <button
                        onClick={() => handleLoadTemplate(template)}
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
                        onClick={() => handleDuplicateTemplate(template)}
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
                        onClick={() => handleDeleteTemplate(template.id)}
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
      )}

      {/* Editor section */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: "relative",
          height: "100vh",
        }}
      >
        <EmailEditor
          ref={editorRef}
          projectId={275580}
          onLoad={() => {
            console.log("Editor loaded");
            // Auto-load last saved template if available
            if (savedTemplates.length > 0 && !currentTemplateId) {
              const lastTemplate = savedTemplates[savedTemplates.length - 1];
              const editor = editorRef.current?.editor;
              if (editor) {
                editor.loadDesign(lastTemplate.design);
                setCurrentTemplateId(lastTemplate.id);
                setTemplateName(lastTemplate.name);
              }
            }
          }}
          minHeight={window.innerHeight}
          style={{
            width: "100%",
            height: "100vh",
          }}
        />
      </div>

      {/* Control Panel */}
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
            onClick={handleSaveTemplate}
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
            {currentTemplateId ? "Update Template" : "Save Template"}
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
            onClick={handleSendTest}
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
    </div>
  );
};

export default MyEmailEditor;
