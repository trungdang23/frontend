import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlannerWorkspace } from '@/features/trips/planning/components/planner-workspace';
import { PlanNode } from '@/features/trips/planning/types/plan-node';
import { LanguageProvider } from '@/shared/i18n/language-provider';

function renderWithProviders(node: ReactNode) {
  render(<LanguageProvider>{node}</LanguageProvider>);
}

function createNode(overrides: Partial<PlanNode> = {}): PlanNode {
  return {
    id: 'node-root',
    tripId: 'trip-01',
    parentId: null,
    type: 'day',
    title: 'Ngày đến Đà Lạt',
    notes: 'Giữ buổi tối đầu tiên nhẹ nhàng.',
    startAt: '2026-07-12T09:00',
    endAt: '2026-07-12T21:00',
    costAmount: 150000,
    costCurrency: 'VND',
    imageUrl: null,
    sortOrder: 0,
    depth: 0,
    createdAt: '2026-04-18T00:00:00.000Z',
    updatedAt: '2026-04-18T00:00:00.000Z',
    ...overrides,
  };
}

describe('Trip planner phase 04', () => {
  it('renders a nested planner tree from flat nodes', () => {
    renderWithProviders(
      <PlannerWorkspace
        defaultCurrency="VND"
        error={null}
        isLoading={false}
        nodes={[
          createNode(),
          createNode({
            id: 'node-child',
            parentId: 'node-root',
            type: 'activity',
            title: 'Đi bộ chợ đêm',
            depth: 1,
          }),
        ]}
        onCreateChild={vi.fn().mockResolvedValue(undefined)}
        onCreateRoot={vi.fn().mockResolvedValue(undefined)}
        onDeleteNode={vi.fn().mockResolvedValue(undefined)}
        onRetry={vi.fn().mockResolvedValue(undefined)}
        onUpdateNode={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText('Ngày đến Đà Lạt')).toBeInTheDocument();
    expect(screen.getByText('Đi bộ chợ đêm')).toBeInTheDocument();
    expect(screen.getByText('Day')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
  });

  it('submits the first root node with the planner payload fields', async () => {
    const onCreateRoot = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <PlannerWorkspace
        defaultCurrency="VND"
        error={null}
        isLoading={false}
        nodes={[]}
        onCreateChild={vi.fn().mockResolvedValue(undefined)}
        onCreateRoot={onCreateRoot}
        onDeleteNode={vi.fn().mockResolvedValue(undefined)}
        onRetry={vi.fn().mockResolvedValue(undefined)}
        onUpdateNode={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /thêm node gốc đầu tiên/i }),
    );
    await userEvent.type(screen.getByLabelText('Tên node'), 'Ngày đến Đà Lạt');
    await userEvent.selectOptions(screen.getByLabelText('Loại node'), 'day');
    await userEvent.type(
      screen.getByLabelText('Thời gian bắt đầu'),
      '2026-07-12T09:00',
    );
    await userEvent.type(
      screen.getByLabelText('Chi phí dự kiến'),
      '250000',
    );
    await userEvent.type(screen.getByLabelText('Tiền tệ'), 'VND');
    await userEvent.click(screen.getByRole('button', { name: /lưu node/i }));

    await waitFor(() => {
      expect(onCreateRoot).toHaveBeenCalledWith({
        type: 'day',
        title: 'Ngày đến Đà Lạt',
        notes: '',
        startAt: '2026-07-12T09:00',
        endAt: '',
        costAmount: '250000',
        costCurrency: 'VND',
        imageUrl: '',
      });
    });
  });
});
