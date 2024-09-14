import { useLocation, useSearchParams } from '@remix-run/react';

const Index = () => {
  const [searchParams] = useSearchParams();
  const iframeTag = searchParams.get('iframe');
  console.log(iframeTag ? iframeTag : 'ništa');
  return (
    <>
      {iframeTag ? (
        <div
          className="h-full"
          dangerouslySetInnerHTML={{ __html: iframeTag }}
        />
      ) : (
        <p>No iframe tag provided</p>
      )}
    </>
  );
};

export default Index;
