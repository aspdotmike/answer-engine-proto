import React, { useState } from 'react';
import { Sparkles, ChevronRight, ChevronUp, X, Check, MessageSquare, ArrowLeft, Send, GripVertical, Plus, Minimize2, Maximize2 } from 'lucide-react';

/**
 * ============================================================================
 * ANSWER FRAMEWORK - COMPONENT DOCUMENTATION
 * ============================================================================
 * 
 * This file documents all components and their states in the Answer Framework
 * prototype. Use this as a reference for implementation and design consistency.
 * 
 * TABLE OF CONTENTS:
 * 1. Floating CTA Button
 * 2. Answer Engine Panel (Expanded & Collapsed)
 * 3. Considerations List
 * 4. Chat Panel
 * 5. Snippet States
 * 6. Clarification Buttons
 * 7. Draft Response Panel
 * 8. Message Types
 * 9. Drop Zone
 */

export default function AnswerFrameworkDocs() {
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    { id: 'all', label: 'All Components' },
    { id: 'cta', label: 'Floating CTA' },
    { id: 'panel', label: 'Panel States' },
    { id: 'considerations', label: 'Considerations' },
    { id: 'snippets', label: 'Snippet States' },
    { id: 'messages', label: 'Message Types' },
    { id: 'inputs', label: 'Input Components' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Answer Framework Components</h1>
        <p className="text-gray-600 mb-6">Interactive documentation of all component states</p>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {/* ================================================================
              1. FLOATING CTA BUTTON
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'cta') && (
            <ComponentSection title="1. Floating CTA Button" description="Bottom-center button to open Answer Engine">
              <StateGrid>
                {/* Default State */}
                <StateCard title="Default" description="Initial state, no snippets collected">
                  <div className="flex justify-center">
                    <div className="px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full cursor-pointer hover:from-teal-700 hover:to-teal-800 transition-all group shadow-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="text-white" size={16} />
                      </div>
                      <div className="pr-1">
                        <h3 className="text-white font-semibold text-sm">Answer Engine</h3>
                        <p className="text-teal-100 text-xs">Leverage the Answer Framework</p>
                      </div>
                      <ChevronRight className="text-white/60 group-hover:text-white" size={18} />
                    </div>
                  </div>
                </StateCard>

                {/* With Progress */}
                <StateCard title="With Progress" description="Shows exploration progress">
                  <div className="flex justify-center">
                    <div className="px-5 py-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-full cursor-pointer shadow-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Sparkles className="text-white" size={16} />
                      </div>
                      <div className="pr-1">
                        <h3 className="text-white font-semibold text-sm">Answer Engine</h3>
                        <p className="text-teal-100 text-xs">2 of 4 explored</p>
                      </div>
                      <ChevronRight className="text-white/60" size={18} />
                    </div>
                  </div>
                </StateCard>

                {/* Loading State */}
                <StateCard title="Loading" description="AI analyzing and preparing considerations">
                  <div className="flex justify-center">
                    <div className="w-[320px] px-5 py-3 bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 rounded-full shadow-lg flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0">
                        <Sparkles className="text-white z-10" size={16} />
                        <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">Preparing Answer Engine</h3>
                        <p className="text-teal-100 text-xs">Analyzing your question...</p>
                      </div>
                    </div>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Loading steps cycle through:
const loadingSteps = [
  'Analyzing your question...',
  'Identifying key themes...',
  'Mapping considerations...',
  'Building framework...',
  'Preparing guidance...'
];`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              2. ANSWER ENGINE PANEL
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'panel') && (
            <ComponentSection title="2. Answer Engine Panel" description="Main panel for exploring considerations">
              <StateGrid>
                {/* Panel Header */}
                <StateCard title="Panel Header" description="Top bar with title and actions">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="font-semibold text-white text-sm">Answer Engine</span>
                      </div>
                      <span className="text-xs text-white/70">(2 snippets)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <Minimize2 size={16} />
                      </button>
                      <button className="ml-1 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </StateCard>

                {/* Collapsed - Desktop (Vertical) */}
                <StateCard title="Collapsed - Desktop" description="Thin vertical bar on side">
                  <div className="flex justify-center">
                    <div className="w-12 bg-white rounded-2xl flex flex-col border border-gray-200 shadow-lg">
                      <div className="p-2 bg-gradient-to-b from-teal-600 to-teal-700 rounded-t-2xl w-full flex justify-center">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 py-4 flex flex-col items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" title="Completed" />
                        <div className="w-2 h-2 rounded-full bg-teal-500 scale-125" title="Active" />
                        <div className="w-2 h-2 rounded-full bg-gray-300" title="Pending" />
                        <div className="w-2 h-2 rounded-full bg-gray-300" title="Pending" />
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <Maximize2 size={14} className="text-gray-400 mx-auto" />
                      </div>
                    </div>
                  </div>
                </StateCard>

                {/* Collapsed - Mobile (Horizontal) */}
                <StateCard title="Collapsed - Mobile" description="Horizontal bar at bottom">
                  <div className="bg-white rounded-t-2xl flex items-center justify-between px-4 py-3 border border-gray-200 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-teal-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">Answer Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      </div>
                      <ChevronUp size={18} className="text-gray-400 ml-2" />
                    </div>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Panel positions
panelPosition: 'left' | 'right' | 'bottom'

// Panel states
showEnginePanel: boolean  // Panel visible
panelCollapsed: boolean   // Collapsed to thin bar`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              3. CONSIDERATIONS LIST
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'considerations') && (
            <ComponentSection title="3. Considerations List" description="List of consideration cards to explore">
              <StateGrid>
                {/* Default */}
                <StateCard title="Default" description="Not yet explored">
                  <div className="p-3 rounded-xl border-2 border-gray-100 hover:border-teal-300 hover:bg-teal-50 cursor-pointer transition-all">
                    <h4 className="text-sm font-medium text-gray-900">Technical Compatibility</h4>
                    <p className="text-xs mt-0.5 text-gray-500">Assess existing infrastructure requirements</p>
                  </div>
                </StateCard>

                {/* Active */}
                <StateCard title="Active" description="Currently being explored">
                  <div className="p-3 rounded-xl border-2 border-teal-500 bg-teal-50 shadow-md cursor-pointer">
                    <h4 className="text-sm font-medium text-teal-800">Cost Analysis</h4>
                    <p className="text-xs mt-0.5 text-teal-600">Evaluate budget and ROI factors</p>
                  </div>
                </StateCard>

                {/* Completed */}
                <StateCard title="Completed" description="Snippet added to answer">
                  <div className="p-3 rounded-xl border-2 border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100 cursor-pointer transition-all">
                    <h4 className="text-sm font-medium text-green-800">Code Compliance</h4>
                    <p className="text-xs mt-0.5 text-green-600">✓ Snippet added · Tap to continue</p>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Consideration object
{
  id: number,
  title: string,
  description: string,
  clarifyingQuestion: string,
  exampleSnippets: string[]  // AI suggestions for this topic
}`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              4. SNIPPET STATES
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'snippets') && (
            <ComponentSection title="4. Snippet States" description="Different states a snippet can be in">
              <StateGrid cols={2}>
                {/* Active/Current Draft */}
                <StateCard title="Current Draft" description="Latest version being worked on">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={12} className="text-amber-600" />
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl rounded-tl-md px-3 py-2 border border-amber-200 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-amber-200 rounded text-xs font-medium text-amber-800">v2</span>
                        <span className="text-xs text-amber-600">Current draft</span>
                      </div>
                      <p className="text-sm text-gray-800">"We need to verify power requirements..."</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs">
                          Keep refining below
                        </button>
                        <button className="px-3 py-1.5 bg-amber-400 text-gray-900 rounded-lg text-xs font-medium flex items-center gap-1">
                          <Plus size={12} />Paste
                        </button>
                      </div>
                    </div>
                  </div>
                </StateCard>

                {/* In Answer */}
                <StateCard title="In Answer" description="Added to the response">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-600" />
                    </div>
                    <div className="bg-green-50 rounded-2xl rounded-tl-md px-3 py-2 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-green-200 rounded text-xs font-medium text-green-800">v2</span>
                          <span className="text-xs text-green-400">·</span>
                          <span className="text-xs text-green-600">In answer</span>
                        </div>
                        <button className="text-xs text-green-600 hover:text-green-800 ml-3">View</button>
                      </div>
                    </div>
                  </div>
                </StateCard>

                {/* Included in Later Version */}
                <StateCard title="Included in vX" description="Superseded by a newer version">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-400" />
                    </div>
                    <div className="bg-green-50/50 rounded-2xl rounded-tl-md px-3 py-2 border border-green-100">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-green-100 rounded text-xs font-medium text-green-700">v1</span>
                        <span className="text-xs text-green-300">·</span>
                        <span className="text-xs text-green-500">Included in v3</span>
                      </div>
                    </div>
                  </div>
                </StateCard>

                {/* Dismissed */}
                <StateCard title="Dismissed" description="User chose not to use this version">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={12} className="text-gray-400" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md px-3 py-2 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-medium text-gray-600">v1</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">Snippet</span>
                        </div>
                        <button className="text-xs text-gray-500 hover:text-gray-700 ml-3">View</button>
                      </div>
                    </div>
                  </div>
                </StateCard>

                {/* Dragging */}
                <StateCard title="Dragging" description="Being dragged to drop zone">
                  <div className="flex justify-center">
                    <div className="bg-amber-100 border-2 border-amber-400 rounded-lg px-3 py-2 shadow-xl max-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={12} className="text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Cost Analysis</span>
                      </div>
                      <p className="text-xs text-gray-700 truncate">"Budget considerations include..."</p>
                    </div>
                  </div>
                </StateCard>

                {/* Version Badge with Dropdown */}
                <StateCard title="Version Badge" description="Shows version history on hover">
                  <div className="relative inline-block">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-100 rounded-full">
                      <Check size={10} className="text-teal-600" />
                      <span className="text-xs font-medium text-teal-700">Snippet v3</span>
                    </div>
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[180px] z-10">
                      <p className="text-xs text-gray-500 mb-2">Version history</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-1.5 rounded bg-green-50">
                          <span className="text-xs font-medium text-green-700">v3</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">added</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-green-50/50">
                          <span className="text-xs font-medium text-green-600">v2</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600">in v3</span>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">v1</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">skipped</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Snippet message object
{
  role: 'snippet',
  content: string,
  consideration: string,
  id: string,
  isFollowUp?: boolean,
  parentSnippetId?: string,
  
  // State flags (mutually exclusive)
  added?: boolean,      // In answer
  dismissed?: boolean,  // User skipped
  includedIn?: number,  // Superseded by version X
  paused?: boolean,     // Temporarily paused
  expanded?: boolean,   // Show full content
}`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              5. MESSAGE TYPES
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'messages') && (
            <ComponentSection title="5. Message Types" description="Different message types in chat">
              <StateGrid>
                {/* Assistant Message */}
                <StateCard title="Assistant Message" description="AI clarifying question">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={12} className="text-gray-500" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-md px-3 py-2 border border-gray-200 max-w-[90%]">
                      <p className="text-sm text-gray-800">What challenges have you encountered with existing door hardware?</p>
                      <button className="flex items-center gap-1 text-xs text-teal-600 mt-2 hover:text-teal-700">
                        <Sparkles size={10} />Follow-up question
                      </button>
                    </div>
                  </div>
                </StateCard>

                {/* User Message */}
                <StateCard title="User Message" description="User's response">
                  <div className="flex justify-end">
                    <div className="bg-gray-800 text-white rounded-2xl rounded-tr-md px-3 py-2 text-sm max-w-[90%]">
                      We have some older frames that may need reinforcement.
                    </div>
                  </div>
                </StateCard>

                {/* Clarification Buttons */}
                <StateCard title="Clarification" description="Question detected options">
                  <div className="flex justify-end">
                    <div className="inline-flex items-center gap-1.5">
                      <button className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <MessageSquare size={11} />
                        Help me understand
                      </button>
                      <button className="px-2.5 py-1 bg-teal-600 text-white rounded-full text-xs font-medium flex items-center gap-1.5">
                        <Sparkles size={11} />
                        Capture this
                      </button>
                    </div>
                  </div>
                </StateCard>

                {/* Resolved Clarification */}
                <StateCard title="Clarification Resolved" description="After user makes choice">
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400 italic">Help me understand</span>
                  </div>
                </StateCard>

                {/* System Message */}
                <StateCard title="System Message" description="Status updates">
                  <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-full px-4 py-1.5 text-xs text-gray-600">
                      Snippet added to your answer
                    </div>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Message roles
role: 'assistant' | 'user' | 'snippet' | 'clarification' | 'system'

// Clarification object
{
  role: 'clarification',
  content: string,      // The user's question that triggered this
  resolved?: boolean,   // User made a choice
  choice?: 'answer' | 'snippet'
}`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              6. INPUT COMPONENTS
              ================================================================ */}
          {(activeSection === 'all' || activeSection === 'inputs') && (
            <ComponentSection title="6. Input Components" description="Text inputs and action buttons">
              <StateGrid cols={2}>
                {/* Chat Input */}
                <StateCard title="Chat Input" description="Share thoughts textarea">
                  <div className="relative">
                    <textarea
                      placeholder="Share your thoughts..."
                      className="w-full p-2.5 pr-16 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm min-h-[80px]"
                      rows={2}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                      <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg">
                        <Sparkles size={18} />
                      </button>
                      <button className="p-2 bg-gray-100 text-gray-400 rounded-lg">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Sparkles size={10} /> Tap sparkle for suggestions
                  </p>
                </StateCard>

                {/* Draft Response Panel */}
                <StateCard title="Draft Response Panel" description="AI-assisted response builder">
                  <div className="p-3 bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-xs font-medium text-gray-900">Draft my response</span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Answer agent suggestions</p>
                    
                    {/* Topic chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <button className="px-2.5 py-1 bg-teal-500 text-white rounded-full text-xs">power/wiring</button>
                      <button className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs">network</button>
                      <button className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs">legacy systems</button>
                    </div>
                    
                    {/* Focus input with chips */}
                    <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border border-gray-200 rounded-lg bg-white mb-3 min-h-[34px]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs">
                        timeline
                        <X size={10} />
                      </span>
                      <input
                        type="text"
                        placeholder=""
                        className="flex-1 min-w-[80px] text-xs focus:outline-none bg-transparent"
                      />
                    </div>
                    
                    <button className="w-full px-3 py-2 bg-amber-400 text-gray-900 rounded-lg text-xs font-medium flex items-center justify-center gap-2">
                      <Sparkles size={12} />
                      Generate
                    </button>
                  </div>
                </StateCard>

                {/* Generate Button States */}
                <StateCard title="Generate Button States" description="Different button states">
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                      <Sparkles size={12} />
                      Generate
                    </button>
                    <button className="w-full px-3 py-2 bg-amber-400 text-gray-900 rounded-lg text-xs font-medium flex items-center justify-center gap-2">
                      <Sparkles size={12} />
                      Generate
                    </button>
                    <button className="w-full px-3 py-2 bg-amber-300 text-gray-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 cursor-wait">
                      <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </button>
                  </div>
                </StateCard>

                {/* Drop Zone */}
                <StateCard title="Drop Zone" description="Target for snippet drag-and-drop">
                  <div className="space-y-3">
                    <div className="h-32 border-2 border-dashed border-teal-300 bg-teal-50 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center mx-auto mb-2">
                          <Plus size={20} className="text-teal-600" />
                        </div>
                        <p className="text-sm text-teal-600 font-medium">Drop snippet here</p>
                      </div>
                    </div>
                    <div className="h-32 border-2 border-dashed border-teal-500 bg-teal-100 rounded-xl flex items-center justify-center scale-[1.02]">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-2 scale-110">
                          <Plus size={20} className="text-white" />
                        </div>
                        <p className="text-sm text-teal-700 font-medium">Release to paste!</p>
                      </div>
                    </div>
                  </div>
                </StateCard>
              </StateGrid>

              <CodeBlock>{`// Focus chips state
const [focusChips, setFocusChips] = useState([]);

// Chip creation: type comma or press Enter
if (value.includes(',')) {
  const parts = value.split(',');
  const newChip = parts[0].trim();
  if (newChip) setFocusChips(prev => [...prev, newChip]);
}

// Backspace to remove last chip
if (e.key === 'Backspace' && !input && focusChips.length > 0) {
  setFocusChips(prev => prev.slice(0, -1));
}`}</CodeBlock>
            </ComponentSection>
          )}

          {/* ================================================================
              7. STATE MANAGEMENT REFERENCE
              ================================================================ */}
          {activeSection === 'all' && (
            <ComponentSection title="7. State Management Reference" description="Key state variables">
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm text-gray-300">{`// Panel State
const [showEnginePanel, setShowEnginePanel] = useState(false);
const [panelCollapsed, setPanelCollapsed] = useState(false);
const [panelPosition, setPanelPosition] = useState('left');
const [activeConsideration, setActiveConsideration] = useState(null);

// Chat State
const [chatMessages, setChatMessages] = useState([]);
const [userInput, setUserInput] = useState('');
const [awaitingClarification, setAwaitingClarification] = useState(false);

// Snippet State
const [snippets, setSnippets] = useState([]);
const [draggingSnippet, setDraggingSnippet] = useState(null);
const [isOverDropZone, setIsOverDropZone] = useState(false);

// Response Builder State
const [showAIReference, setShowAIReference] = useState(false);
const [selectedIdeaIndexes, setSelectedIdeaIndexes] = useState([]);
const [focusChips, setFocusChips] = useState([]);
const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

// Loading State
const [isLoadingConsiderations, setIsLoadingConsiderations] = useState(false);
const [loadingStep, setLoadingStep] = useState(0);
const [isBuildingAnswer, setIsBuildingAnswer] = useState(false);

// Version History
const [showVersionHistory, setShowVersionHistory] = useState(false);`}</pre>
              </div>
            </ComponentSection>
          )}

          {/* ================================================================
              8. RESPONSIVE BREAKPOINTS
              ================================================================ */}
          {activeSection === 'all' && (
            <ComponentSection title="8. Responsive Breakpoints" description="Mobile vs Desktop behavior">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">📱 Mobile (&lt; 640px)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Panel takes full screen</li>
                    <li>• Collapsed panel is horizontal bar at bottom</li>
                    <li>• Considerations list hidden when chat active</li>
                    <li>• Back arrow to return to considerations</li>
                    <li>• Floating CTA is full-width with side margins</li>
                    <li>• Larger touch targets (44px+)</li>
                    <li>• Semi-transparent backdrop overlay</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">🖥️ Desktop (≥ 640px)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Panel is floating with margins</li>
                    <li>• Collapsed panel is thin vertical bar on side</li>
                    <li>• Split view: considerations (1/4) + chat (3/4)</li>
                    <li>• X button to close chat</li>
                    <li>• Floating CTA is centered, fixed width</li>
                    <li>• Standard touch targets</li>
                    <li>• Transparent backdrop</li>
                  </ul>
                </div>
              </div>
            </ComponentSection>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ComponentSection({ title, description, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StateGrid({ children, cols = 3 }) {
  return (
    <div className={`grid gap-4 mb-4 ${cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
      {children}
    </div>
  );
}

function StateCard({ title, description, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <div>{children}</div>
    </div>
  );
}

function CodeBlock({ children }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
      <pre className="text-sm text-gray-300">{children}</pre>
    </div>
  );
}