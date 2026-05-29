export class DomainException extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class TaskNotFoundException extends DomainException {
  constructor(taskId: string) {
    super(`Task with id ${taskId} not found`);
    this.name = 'TaskNotFoundException';
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'User not authorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

export class InvalidTaskException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTaskException';
  }
}
