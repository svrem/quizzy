import { createContext, useContext, useState } from 'react';

export enum DemoState {
  Asking,
  Demo,
  Normal,
  CategoryExplainer,
  CategorySelector,
  QuestionExplainer,
  Question,
  ScoreExplainer,
  ProfileExplainer,
  Ending,
}

type DemoContextType = {
  demoState: DemoState;
  setDemoState: (state: DemoState) => void;
  explainer: string;
  setExplainer: (explainer: string) => void;
  nextForExplainer: DemoState;
  setNextForExplainer: (next: DemoState) => void;
};

const DemoContext = createContext<DemoContextType | null>(null);

type DemoProviderProps = {
  children: React.ReactNode;
};

export default function DemoProvider({ children }: DemoProviderProps) {
  const [explainer, setExplainer] = useState<string>('');
  const [demoState, setDemoState] = useState<DemoState>(DemoState.Asking);
  const [nextForExplainer, setNextForExplainer] = useState<DemoState>(
    DemoState.CategorySelector,
  );

  return (
    <DemoContext.Provider
      value={{
        demoState,
        setDemoState,
        explainer,
        setExplainer,
        setNextForExplainer,
        nextForExplainer,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
}
