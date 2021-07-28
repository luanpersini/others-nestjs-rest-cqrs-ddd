import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { WithdrawCommand } from 'src/accounts/application/commands/withdraw.command';
import { InjectionToken } from 'src/accounts/application/injection.token';

import { ErrorMessage } from 'src/accounts/domain/error';
import { AccountRepository } from 'src/accounts/domain/repository';

@CommandHandler(WithdrawCommand)
export class WithdrawHandler implements ICommandHandler<WithdrawCommand, void> {
  constructor(
    @Inject(InjectionToken.ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: WithdrawCommand): Promise<void> {
    const data = await this.accountRepository.findById(command.id);
    if (!data) throw new NotFoundException(ErrorMessage.ACCOUNT_IS_NOT_FOUND);

    const account = this.eventPublisher.mergeObjectContext(data);

    account.withdraw(command.amount, command.password);

    await this.accountRepository.save(account);

    account.commit();
  }
}
