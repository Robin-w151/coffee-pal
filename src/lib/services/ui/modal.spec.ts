import type { Component } from 'svelte';
import { describe, expect, test } from 'vitest';
import { ModalService, type CustomModalProps } from './modal.svelte';

const LoginModal = (() => {}) as unknown as Component<
  { loginUrl: string } & CustomModalProps<boolean>
>;

describe('ModalService', () => {
  test.each([
    ['confirm', true, true],
    ['cancel', false, false],
    ['backdrop or Escape', undefined, false],
  ])('confirm resolves %s with %s', async (_name, result, expected) => {
    const modal = new ModalService();
    const confirmed = modal.confirm({ title: 'Title', body: 'Body' });

    expect(modal.current).toMatchObject({ kind: 'confirm', options: { title: 'Title' } });
    modal.close(result);

    await expect(confirmed).resolves.toBe(expected);
    expect(modal.current).toBeUndefined();
  });

  test('shows queued modals one after another, each with its own answer', async () => {
    const modal = new ModalService();
    const first = modal.confirm({ title: 'First', body: '' });
    const second = modal.confirm({ title: 'Second', body: '', dangerous: true });

    expect(modal.current).toMatchObject({ options: { title: 'First' } });
    modal.close(true);
    expect(modal.current).toMatchObject({ options: { title: 'Second', dangerous: true } });
    modal.close(false);

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
    expect(modal.current).toBeUndefined();
  });

  test('open passes the props and resolves with the value given to close', async () => {
    const modal = new ModalService();
    const confirmed = modal.open(LoginModal, { loginUrl: 'https://login.example.test' });

    expect(modal.current).toMatchObject({
      kind: 'component',
      component: LoginModal,
      props: { loginUrl: 'https://login.example.test' },
    });
    modal.close(true);

    await expect(confirmed).resolves.toBe(true);
  });

  test('open resolves undefined when dismissed', async () => {
    const modal = new ModalService();
    const confirmed = modal.open(LoginModal, { loginUrl: '' });

    modal.close();

    await expect(confirmed).resolves.toBeUndefined();
  });

  test('close without an open modal does nothing', () => {
    const modal = new ModalService();

    expect(() => modal.close(true)).not.toThrow();
  });
});
