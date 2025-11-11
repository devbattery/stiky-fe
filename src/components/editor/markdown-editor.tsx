'use client';

import { useEffect, useRef } from 'react';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<InstanceType<typeof Editor> | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const instance = new Editor({
      el: containerRef.current,
      height: '600px',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      initialValue: value ?? '',
      usageStatistics: false,
      hideModeSwitch: true,
    });

    editorRef.current = instance;

    const handler = () => {
      const markdown = instance.getMarkdown();
      onChangeRef.current(markdown);
    };

    instance.on('change', handler);

    return () => {
      instance.off('change', handler);
      instance.destroy();
      editorRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const instance = editorRef.current;
    if (!instance) {
      return;
    }
    const currentValue = instance.getMarkdown();
    if (value !== currentValue) {
      instance.setMarkdown(value ?? '');
    }
  }, [value]);

  return <div ref={containerRef} className="rounded-md border border-border" />;
}
