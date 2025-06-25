// src/components/EmailEditor.tsx
import React from "react";
import EmailEditor from "react-email-editor";
import { useEmailEditor } from "./hooks/useEmailEditor";
import { TemplateManager } from "./components/TemplateManager";
import { ControlPanel } from "./components/ControlPanel";

const MyEmailEditor: React.FC = () => {
  const {
    // Refs
    editorRef,
    
    // State
    fromEmail,
    setFromEmail,
    testEmails,
    setTestEmails,
    isLoading,
    savedTemplates,
    showTemplateManager,
    setShowTemplateManager,
    templateName,
    setTemplateName,
    currentTemplateId,
    mergeTags,
    
    // Actions
    handleSendTest,
    handleSaveTemplate,
    handleLoadTemplate,
    handleDeleteTemplate,
    handleNewTemplate,
    handleDuplicateTemplate,
    handleEditorLoad,
    exportHtmlWithBase64,
  } = useEmailEditor();

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
      <TemplateManager
        showTemplateManager={showTemplateManager}
        setShowTemplateManager={setShowTemplateManager}
        savedTemplates={savedTemplates}
        currentTemplateId={currentTemplateId}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
        onNewTemplate={handleNewTemplate}
      />

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
          onLoad={handleEditorLoad}
          minHeight={window.innerHeight}
          style={{
            width: "100%",
            height: "100vh",
          }}
          options={{
            version: '1.259.0', // Test newer version
            mergeTags: mergeTags.reduce((acc, tag) => {
              acc[tag.name] = {
                name: tag.name,
                value: `{{${tag.name}}}`,
                sample: tag.sample || tag.value
              };
              return acc;
            }, {} as Record<string, { name: string; value: string; sample: string }>),
          }}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        savedTemplates={savedTemplates}
        setShowTemplateManager={setShowTemplateManager}
        templateName={templateName}
        setTemplateName={setTemplateName}
        currentTemplateId={currentTemplateId}
        fromEmail={fromEmail}
        setFromEmail={setFromEmail}
        testEmails={testEmails}
        setTestEmails={setTestEmails}
        isLoading={isLoading}
        onSaveTemplate={handleSaveTemplate}
        onSendTest={handleSendTest}
        exportHtmlWithBase64={exportHtmlWithBase64}
      />
    </div>
  );
};

export default MyEmailEditor;
