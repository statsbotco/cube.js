import React, { useEffect } from 'react';
import { Spin } from 'antd';

import { dispatchChartEvent } from '../../utils';
import useDeepCompareMemoize from '../../hooks/deep-compare-memoize';

export default function ChartRenderer({
  iframeRef,
  framework,
  isChartRendererReady,
  chartingLibrary,
  chartType,
  query,
  pivotConfig,
  onChartRendererReadyChange,
}) {
  useEffect(() => {
    return () => {
      onChartRendererReadyChange(false);
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', () => {
        onChartRendererReadyChange(true);
      });
    }
  }, [iframeRef]);

  useEffect(() => {
    if (isChartRendererReady && iframeRef.current) {
      dispatchChartEvent(iframeRef.current.contentDocument, {
        pivotConfig,
        query,
        chartType,
        chartingLibrary,
      });
    }
  }, useDeepCompareMemoize([iframeRef, isChartRendererReady, pivotConfig, query, chartType]));

  return (
    <div>
      {!isChartRendererReady ? <Spin /> : null}

      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          minHeight: 400,
          border: 'none',
          visibility: isChartRendererReady ? 'visible' : 'hidden',
        }}
        title="Chart renderer"
        src={`./chart-renderers/${framework}/index.html`}
      />
    </div>
  );
}