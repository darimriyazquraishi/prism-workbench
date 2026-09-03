import React from 'react';
import { Shell } from './components/layout/Shell';
import { useWorkbenchStore } from './store/useWorkbenchStore';
import { Dashboard } from './pages/Dashboard';
import { AgentWorkspace } from './pages/AgentWorkspace';
import { DocumentsPage } from './pages/DocumentsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { ArtifactsPage } from './pages/ArtifactsPage';
import { ModelsPage } from './pages/ModelsPage';
import { AuditPage } from './pages/AuditPage';
import { SystemPage } from './pages/SystemPage';

export function App() {
  const { activeTab } = useWorkbenchStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'agent': return <AgentWorkspace />;
      case 'documents': return <DocumentsPage />;
      case 'knowledge': return <KnowledgePage />;
      case 'artifacts': return <ArtifactsPage />;
      case 'models': return <ModelsPage />;
      case 'tools': return <AgentWorkspace />;
      case 'audit': return <AuditPage />;
      case 'system': return <SystemPage />;
      default: return <AgentWorkspace />;
    }
  };

  return <Shell>{renderContent()}</Shell>;
}

export default App;
