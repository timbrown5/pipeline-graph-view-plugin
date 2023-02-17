import React, { memo } from 'react';
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActions";

import Collapse from "@mui/material/Collapse";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StepInfo } from "./PipelineConsoleModel";
import { ConsoleLine } from "./ConsoleLine";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

import { LOG_FETCH_SIZE } from "./PipelineConsoleModel";

import { Virtuoso } from 'react-virtuoso'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

type ConsoleLogCardProps = {
  step: StepInfo;
  isExpanded: boolean;
  width: number;
  height: number;
  handleStepToggle: (event: React.SyntheticEvent<{}>, nodeId: string) => void;
  handleMoreConsoleClick: (nodeId: string, startByte: number) => void;
};

export class ConsoleLogCard extends React.Component<ConsoleLogCardProps> {
  constructor(props: ConsoleLogCardProps) {
    super(props);
    this.handleStepToggle = this.handleStepToggle.bind(this);  
  }

  handleStepToggle(event: React.MouseEvent<HTMLElement>) {
    this.props.handleStepToggle(event, String(this.props.step.id));
  }


  getRowHeight(index: number) {
    return 20;
  }

  getTrucatedLogWarning() {
    if (this.props.step.consoleLines && this.props.step.consoleStartByte != 0) {
      return (
        <Grid container>
          <Grid item xs={6} sm className="show-more-console">
            <Typography align="right" className="step-header">
              {`Missing ${this.prettySizeString(
                this.props.step.consoleStartByte
              )} of logs.`}
            </Typography>
          </Grid>
          <Grid item xs={6} sm className="show-more-console">
            <Button
              variant="text"
              sx={{ padding: "0px", textTransform: "none" }}
              onClick={() => {
                let startByte =
                  this.props.step.consoleStartByte - LOG_FETCH_SIZE;
                console.debug(
                  `startByte '${this.props.step.consoleStartByte}' -> '${startByte}'`
                );
                if (startByte < 0) {
                  startByte = 0;
                }
                this.props.handleMoreConsoleClick(
                  String(this.props.step.id),
                  startByte
                );
              }}
            >
              Show more logs
            </Button>
          </Grid>
        </Grid>
      );
    } else {
      <div></div>;
    }
  }

  prettySizeString(size: number) {
    let kib = 1024;
    let mib = 1024 * 1024;
    let gib = 1024 * 1024 * 1024;
    if (size < kib) {
      return `${size}b`;
    } else if (size < mib) {
      return `${(size / kib).toFixed(2)}KiB`;
    } else if (size < gib) {
      return `${(size / mib).toFixed(2)}MiB`;
    }
    return `${(size / gib).toFixed(2)}GiB`;
  }

  renderSimpleConsoleLines() {
    if (this.props.step.consoleLines) {
      return this.props.step.consoleLines.map((content: string, index: number) => {
        return (
          <ConsoleLine
            lineNumber={String(index)}
            content={content}
            stepId={String(this.props.step.id)}
            startByte={this.props.step.consoleStartByte}
          />
        )
      })
    } else {
      return (
        <div></div>
      )
    }
  }

  renderConsoleLine(index: number) {
    if (this.props.step.consoleLines) {
      return (
        <ConsoleLine
          lineNumber={String(index)}
          content={this.props.step.consoleLines[index]}
          stepId={String(this.props.step.id)}
          startByte={this.props.step.consoleStartByte}
        />
      )
    }
  }

  getNumConsoleLines() {
    return this.props.step.consoleLines ? this.props.step.consoleLines.length: 0;
  }

  getViewWidth(): number {
    let stageDetailElement = document.getElementById(`console-root-${this.props.step.stageId}`)
    if (stageDetailElement) {
      return stageDetailElement.getBoundingClientRect().width
    }
    return 50;
  }

  getCalculateHeight(): number {
    // This is a bad solution until we can find a better one.
    let consoleLines = this.getNumConsoleLines()
    let maxHeight = 800
    let lineHeight = 25;
    // More lines than this will reult in something bigger than maxHeight.
    if (consoleLines < maxHeight/lineHeight)  {
      let charWidth = 10;
      let viewWidth = this.getViewWidth();
      let cumulativeHeight = 0;
      for (let i = 0; i < consoleLines; i++) {
        let lineLength = this.props.step.consoleLines[i].length;
        cumulativeHeight += (Math.floor((lineLength*charWidth)/viewWidth) + 1) * lineHeight;
      }
      if (cumulativeHeight < maxHeight) {
        return cumulativeHeight;
      }
    }
    return maxHeight;
  }


  render() {
    return (
      <Card
        className="step-detail-group"
        key={`step-card-${this.props.step.id}`}
        sx={{ padding: "5px" }}
      >
        <CardActionArea
          onClick={this.handleStepToggle}
          aria-label="Show console log."
          className={`step-header-${this.props.step.state.toLowerCase()}`}
          key={`step-action-area-${this.props.step.id}`}
        >
          <Grid container key={`step-root-container-${this.props.step.id}`}>
            <Grid item container xs={10}>
              <Typography
                className="detail-element-header"
                noWrap={true}
                component="div"
                key={`step-name-text-${this.props.step.id}`}
              >
                {this.props.step.name.substring(
                  0,
                  this.props.step.name.lastIndexOf("-")
                ).trimEnd()}
              </Typography>
              <Typography
                className="detail-element-text"
                component="div"
                key={`step-duration-text-${this.props.step.id}`}
              >
                {this.props.step.name.substring(
                  this.props.step.name.lastIndexOf("-") + 1,
                  this.props.step.name.length
                ).trimStart()}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <Typography
                className="detail-element-text"
                align="right"
                component="div"
                key={`step-duration-text-${this.props.step.id}`}
              >
                {this.props.step.totalDurationMillis.substring(
                  this.props.step.totalDurationMillis.indexOf(" ") + 1,
                  this.props.step.totalDurationMillis.length
                )}
              </Typography>
            </Grid>
            <Grid item xs={1}>
              <ExpandMore
                expand={this.props.isExpanded}
                aria-expanded
                key={`step-expand-button-${this.props.step.id}`}
              >
                <ExpandMoreIcon key={`step-expand-icon-${this.props.step.id}`}/>
              </ExpandMore>
            </Grid>
          </Grid>
        </CardActionArea>
        <Collapse
          in={this.props.isExpanded}
          timeout={50}
          unmountOnExit
          key={`step-colapsable-console-${this.props.step.id}`}
        >
          <CardContent
            className="step-content"
            key={`step-console-content-${this.props.step.id}`}
          >
            <div>
              {this.getTrucatedLogWarning()}
            </div>
            <Virtuoso
              style={{ height: `${this.getCalculateHeight()}px`}}
              totalCount={this.getNumConsoleLines()}
              itemContent={(index: number) => this.renderConsoleLine(index)}
            />
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}