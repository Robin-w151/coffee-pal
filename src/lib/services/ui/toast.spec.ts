import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ToastService } from './toast.svelte';

describe('ToastService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('closes after the default timeout of 5 s', () => {
    const toast = new ToastService();
    const onClose = vi.fn();

    toast.info('Saved', { onClose });
    vi.advanceTimersByTime(4_999);
    expect(toast.toasts).toHaveLength(1);
    vi.advanceTimersByTime(1);

    expect(toast.toasts).toHaveLength(0);
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('uses a custom timeout', () => {
    const toast = new ToastService();

    toast.info('Did you click to fast?', { timeout: 15_000 });
    vi.advanceTimersByTime(14_999);
    expect(toast.toasts).toHaveLength(1);
    vi.advanceTimersByTime(1);

    expect(toast.toasts).toHaveLength(0);
  });

  test('keeps persistent toasts until dismissed', () => {
    const toast = new ToastService();
    const onClose = vi.fn();

    const id = toast.info('Update available', { persistent: true, onClose });
    vi.advanceTimersByTime(60_000);
    expect(toast.toasts.map((message) => message.id)).toEqual([id]);

    toast.dismiss(id);
    expect(toast.toasts).toHaveLength(0);
    expect(onClose).toHaveBeenCalledOnce();
  });

  test('runs onClose once, however often the toast is closed', () => {
    const toast = new ToastService();
    const onClose = vi.fn();

    const id = toast.error('Sync failed', { onClose });
    toast.dismiss(id);
    toast.dismiss(id);
    vi.advanceTimersByTime(5_000);

    expect(onClose).toHaveBeenCalledOnce();
  });

  test('runs the action, then closes the toast', async () => {
    const toast = new ToastService();
    const calls: Array<string> = [];

    const id = toast.info('Did you click to fast?', {
      action: { label: 'Undo', onClick: () => void calls.push('undo') },
      onClose: () => calls.push('close'),
    });
    await toast.runAction(id);
    vi.advanceTimersByTime(5_000);

    expect(calls).toEqual(['undo', 'close']);
    expect(toast.toasts).toHaveLength(0);
  });

  test('exposes kind, message and action label', () => {
    const toast = new ToastService();

    toast.info('Info');
    toast.error('Error', { action: { label: 'Retry', onClick: () => {} } });

    expect(toast.toasts).toMatchObject([
      { kind: 'info', message: 'Info' },
      { kind: 'error', message: 'Error', action: { label: 'Retry' } },
    ]);
  });
});
