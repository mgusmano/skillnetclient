import React from 'react'
import ReactFC from "react-fusioncharts";
import FusionTheme from 'fusioncharts/themes/fusioncharts.theme.fusion';
import GammelTheme from 'fusioncharts/themes/fusioncharts.theme.gammel';
import CandyTheme from 'fusioncharts/themes/fusioncharts.theme.candy';
import ZuneTheme from 'fusioncharts/themes/fusioncharts.theme.zune';
import OceanTheme from 'fusioncharts/themes/fusioncharts.theme.ocean';
import CarbonTheme from 'fusioncharts/themes/fusioncharts.theme.carbon';

// Resolves charts dependancy
ReactFC.fcRoot(window.FusionCharts, FusionTheme, GammelTheme, CandyTheme, ZuneTheme, OceanTheme, CarbonTheme);

class Chart extends React.Component {

  render() {
    const { dataSource } = this.props;
    let chartType = 'scrollline2d';
    if (dataSource && dataSource.categories) {
      dataSource.chart.labelDisplay = dataSource.categories[0].category.length > 2 ? 'rotate' : 'auto'
      chartType = dataSource.categories[0].category.length > 2 ? 'scrollline2d' : 'msColumn2D'
    }

    return (
      <ReactFC
        type={chartType}
        width="100%"
        height="70%"
        dataFormat="JSON"
        dataSource={dataSource}
      />
    );
  }
}

export default Chart;