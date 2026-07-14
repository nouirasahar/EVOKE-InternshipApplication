const normalizeStatus = (status) => {
  const allowedStatuses = new Set([
    "pending",
    "running",
    "completed",
    "warning",
    "failed",
  ]);

  return allowedStatuses.has(status)
    ? status
    : "pending";
};

const serializeError = (error) => ({
  name: error?.name || "Error",
  message:
    error?.message ||
    "Unknown execution error.",
  code:
    error?.code ||
    error?.cause?.code ||
    null,
  status:
    error?.status || null,
});

export class ExecutionTracker {
  constructor() {
    this.executions = new Map();
    this.pipelineStartedAt = Date.now();
  }

  start(agentName, metadata = {}) {
    const execution = {
      name: agentName,
      status: "running",
      progress: 5,
      startedAt: new Date(),
      finishedAt: null,
      executionTimeMs: 0,
      logs: [],
      output: {},
      error: null,
      metadata,
    };

    this.executions.set(
      agentName,
      execution
    );

    return execution;
  }

  addLog(agentName, message) {
    const execution =
      this.executions.get(agentName);

    if (!execution) {
      return;
    }

    execution.logs.push(
      String(message)
    );
  }

  setProgress(agentName, progress) {
    const execution =
      this.executions.get(agentName);

    if (!execution) {
      return;
    }

    execution.progress = Math.max(
      0,
      Math.min(100, Number(progress) || 0)
    );
  }

  complete(
    agentName,
    {
      logs = [],
      output = {},
      status = "completed",
    } = {}
  ) {
    const execution =
      this.executions.get(agentName);

    if (!execution) {
      throw new Error(
        `Execution "${agentName}" was not started.`
      );
    }

    const finishedAt = Date.now();

    execution.status =
      normalizeStatus(status);
    execution.progress = 100;
    execution.finishedAt =
      new Date(finishedAt);
    execution.executionTimeMs =
      finishedAt -
      execution.startedAt.getTime();

    execution.logs.push(
      ...logs.map(String)
    );

    execution.output = output;

    return execution;
  }

  fail(agentName, error, logs = []) {
    const execution =
      this.executions.get(agentName);

    if (!execution) {
      throw error;
    }

    const finishedAt = Date.now();

    execution.status = "failed";
    execution.progress = 100;
    execution.finishedAt =
      new Date(finishedAt);
    execution.executionTimeMs =
      finishedAt -
      execution.startedAt.getTime();

    execution.logs.push(
      ...logs.map(String),
      error?.message ||
        "Agent execution failed."
    );

    execution.error =
      serializeError(error);

    return execution;
  }

  async run(
    agentName,
    task,
    {
      metadata = {},
      onSuccess,
      onFailure,
    } = {}
  ) {
    this.start(agentName, metadata);

    try {
      const result = await task({
        tracker: this,
        agentName,
      });

      const completion =
        typeof onSuccess === "function"
          ? await onSuccess(result)
          : {};

      this.complete(
        agentName,
        completion || {}
      );

      return result;
    } catch (error) {
      const failureLogs =
        typeof onFailure === "function"
          ? await onFailure(error)
          : [];

      this.fail(
        agentName,
        error,
        Array.isArray(failureLogs)
          ? failureLogs
          : []
      );

      throw error;
    }
  }

  getAgentRecords() {
    return Array.from(
      this.executions.values()
    ).map((execution) => ({
      name: execution.name,
      status: execution.status,
      progress: execution.progress,
      executionTimeMs:
        execution.executionTimeMs,
      logs: execution.logs,
      output: execution.output,
    }));
  }

  getPipelineMetrics() {
    const records = Array.from(
      this.executions.values()
    );

    return {
      executionTimeMs:
        Date.now() -
        this.pipelineStartedAt,

      agentsCount: records.length,

      completedAgents:
        records.filter(
          (record) =>
            record.status === "completed"
        ).length,

      warningAgents:
        records.filter(
          (record) =>
            record.status === "warning"
        ).length,

      failedAgents:
        records.filter(
          (record) =>
            record.status === "failed"
        ).length,
    };
  }
}

export const createExecutionTracker = () =>
  new ExecutionTracker();