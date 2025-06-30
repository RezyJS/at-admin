import Markdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownText(props: Options) {
  return (
    <article className='prose max-w-none'>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className='m-0 line-clamp-3'>{children}</p>,
          h1: ({ children }) => (
            <h1 className='text-5xl m-0 line-clamp-3'>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-4xl m-0 line-clamp-3'>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-3xl m-0 line-clamp-3'>{children}</h3>
          ),
          h4: ({ children }) => (
            <h1 className='text-2xl m-0 line-clamp-3'>{children}</h1>
          ),
          h5: ({ children }) => (
            <h2 className='text-xl m-0 line-clamp-3'>{children}</h2>
          ),
          h6: ({ children }) => (
            <h3 className='text-l m-0 line-clamp-3'>{children}</h3>
          ),
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {props.children}
      </Markdown>
    </article>
  );
}
