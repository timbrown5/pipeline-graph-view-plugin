package io.jenkins.plugins.pipelinegraphview.utils;

import java.util.List;

public class PipelineStage extends AbstractPipelineNode {

    private List<PipelineStage> children;
    private String seqContainerName;
    private final PipelineStage nextSibling;
    private boolean sequential;
    private boolean synthetic;

    public PipelineStage(
            String id,
            String name,
            List<PipelineStage> children,
            String state,
            int completePercent,
            String type,
            String title,
            String seqContainerName,
            PipelineStage nextSibling,
            boolean sequential,
            boolean synthetic,
            Long pauseDurationMillis,
            Long startTimeMillis,
            Long totalDurationMillis) {
        super(
                id,
                name,
                state,
                completePercent,
                type,
                title,
                getUserFriendlyPauseDuration(pauseDurationMillis),
                getUserFriendlyStartTime(startTimeMillis),
                getUserFriendlyDuration(totalDurationMillis));
        this.children = children;
        this.seqContainerName = seqContainerName;
        this.nextSibling = nextSibling;
        this.sequential = sequential;
        this.synthetic = synthetic;
    }

    public PipelineStage getNextSibling() {
        return nextSibling;
    }

    // TODO clean up naming
    // HACK: blue ocean has a broken name for this 'isSequential'
    public boolean getIsSequential() {
        return sequential;
    }

    public String getSeqContainerName() {
        return seqContainerName;
    }

    public List<PipelineStage> getChildren() {
        return children;
    }

    public boolean isSynthetic() {
        return synthetic;
    }
}
