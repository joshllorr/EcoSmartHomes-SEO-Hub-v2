import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import XPCard from '../XPCard';
import { UserXP, TaskItem, WeeklyChallenge } from '../../types';

const mockXP: UserXP = {
  level: 5,
  current: 75,
  target: 100,
  streak_days: 12,
};

const mockTasks: TaskItem[] = [
  { id: 't1', title: 'Connect your CMS', xp: 10, completed: true },
  { id: 't2', title: 'Run initial SERP audit', xp: 20, completed: false },
  { id: 't3', title: 'Generate SEO title & meta', xp: 15, completed: false },
];

const mockChallenges: WeeklyChallenge[] = [
  {
    id: 'c1',
    title: 'Publish 3 articles',
    current: 2,
    target: 3,
    completed: false,
  },
  {
    id: 'c2',
    title: 'Achieve Gold tier',
    current: 1,
    target: 1,
    completed: true,
  },
];

describe('XPCard', () => {
  it('renders the XP level header', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('SEO Level Rank')).toBeInTheDocument();
  });

  it('renders the streak days', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('12 Days')).toBeInTheDocument();
  });

  it('renders the progress bar with correct percentage', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('75 / 100 XP (75%)')).toBeInTheDocument();
  });

  it('renders onboarding tasks', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('Onboarding Tasks')).toBeInTheDocument();
    expect(screen.getByText('Connect your CMS')).toBeInTheDocument();
    expect(screen.getByText('Run initial SERP audit')).toBeInTheDocument();
    expect(screen.getByText('Generate SEO title & meta')).toBeInTheDocument();
  });

  it('renders completed tasks with checkmark and strikethrough', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('Connect your CMS')).toBeInTheDocument();
  });

  it('renders XP gain badge for incomplete tasks', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('+20 XP')).toBeInTheDocument();
    expect(screen.getByText('+15 XP')).toBeInTheDocument();
  });

  it('does not render XP gain badge for completed tasks', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    const badges = screen.getAllByText(/\+.*XP/);
    expect(badges.length).toBe(2);
  });

  it('calls onToggleTask when a task button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleTask = vi.fn();

    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={onToggleTask}
      />,
    );

    await user.click(screen.getByText('Run initial SERP audit'));
    expect(onToggleTask).toHaveBeenCalledWith('t2');
  });

  it('renders weekly challenges section', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('Weekly Challenges')).toBeInTheDocument();
    expect(screen.getByText('Publish 3 articles')).toBeInTheDocument();
    expect(screen.getByText('Achieve Gold tier')).toBeInTheDocument();
  });

  it('renders challenge progress correctly', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('renders completed challenges with green text', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('Achieve Gold tier')).toBeInTheDocument();
  });

  it('renders with empty tasks and challenges', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={[]}
        weeklyChallenges={[]}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('Onboarding Tasks')).toBeInTheDocument();
    expect(screen.getByText('Weekly Challenges')).toBeInTheDocument();
  });

  it('has the correct id on the card', () => {
    render(
      <XPCard
        xp={mockXP}
        tasks={mockTasks}
        weeklyChallenges={mockChallenges}
        onToggleTask={vi.fn()}
      />,
    );
    expect(document.getElementById('xp-gamification-card')).toBeInTheDocument();
  });

  it('clamps progress percentage to 100 when current exceeds target', () => {
    const highXP: UserXP = {
      level: 10,
      current: 150,
      target: 100,
      streak_days: 30,
    };

    render(
      <XPCard
        xp={highXP}
        tasks={[]}
        weeklyChallenges={[]}
        onToggleTask={vi.fn()}
      />,
    );
    expect(screen.getByText('150 / 100 XP (100%)')).toBeInTheDocument();
  });
});
