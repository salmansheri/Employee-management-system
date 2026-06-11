import { useLocation, useNavigate } from "@tanstack/react-router";
import {
	Bell,
	Calendar,
	CalendarCheck,
	CalendarX,
	Check,
	CheckCheck,
	ChevronRight,
	ClipboardList,
	Clock,
	Home,
	UserPlus,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { NotificationDto } from "../client/types.gen";
import {
	useMarkAllReadMutation,
	useMarkReadMutation,
	useNotificationsQuery,
	useUnreadCountQuery,
} from "../hooks/useNotifications";
import { formatRelativeTime } from "../lib/utils";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "./ui/sheet";

export function Header() {
	const location = useLocation();
	const navigate = useNavigate();
	const [showNotifications, setShowNotifications] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"all" | "unread" | "tasks" | "requests"
	>("all");
	const [time, setTime] = useState(new Date());

	// Clock update effect
	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	// Fetch notifications data
	const { data: notifications } = useNotificationsQuery();
	const { data: unreadCountData } = useUnreadCountQuery();

	const unreadCount =
		typeof unreadCountData === "number"
			? unreadCountData
			: (unreadCountData as any)?.count || 0;

	// Mutations for notifications
	const markReadMutation = useMarkReadMutation();
	const markAllReadMutation = useMarkAllReadMutation();

	// Format digital clock
	const formattedTime = time.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
	const formattedDate = time.toLocaleDateString([], {
		weekday: "short",
		month: "short",
		day: "numeric",
	});

	// Get active breadcrumb title
	const getBreadcrumbTitle = () => {
		const path = location.pathname;
		if (path === "/") return "Dashboard";
		if (path.startsWith("/employees")) return "Employee Directory";
		if (path.startsWith("/leaves")) return "Leave Management";
		if (path.startsWith("/tasks")) return "Tasks Kanban";
		if (path.startsWith("/settings")) return "Settings";
		return "EMS";
	};

	// Filter notifications by active tab
	const filteredNotifications = (notifications || []).filter(
		(notif: NotificationDto) => {
			if (activeTab === "unread") return !notif.read;
			if (activeTab === "tasks") return notif.type === "TASK_ASSIGNED";
			if (activeTab === "requests") {
				return [
					"LEAVE_APPLIED",
					"LEAVE_APPROVED",
					"LEAVE_REJECTED",
					"WFH_APPLIED",
					"WFH_APPROVED",
					"WFH_REJECTED",
				].includes(notif.type || "");
			}
			return true; // 'all'
		},
	);

	const getNotificationIconInfo = (type?: string) => {
		switch (type) {
			case "LEAVE_APPLIED":
				return {
					icon: Calendar,
					colorClass: "text-yellow bg-yellow/10 border-yellow/20",
					hoverColorClass: "group-hover:bg-yellow/20",
				};
			case "LEAVE_APPROVED":
				return {
					icon: CalendarCheck,
					colorClass: "text-green bg-green/10 border-green/20",
					hoverColorClass: "group-hover:bg-green/20",
				};
			case "LEAVE_REJECTED":
				return {
					icon: CalendarX,
					colorClass: "text-red bg-red/10 border-red/20",
					hoverColorClass: "group-hover:bg-red/20",
				};
			case "WFH_APPLIED":
				return {
					icon: Home,
					colorClass: "text-peach bg-peach/10 border-peach/20",
					hoverColorClass: "group-hover:bg-peach/20",
				};
			case "WFH_APPROVED":
				return {
					icon: Check,
					colorClass: "text-teal bg-teal/10 border-teal/20",
					hoverColorClass: "group-hover:bg-teal/20",
				};
			case "WFH_REJECTED":
				return {
					icon: X,
					colorClass: "text-maroon bg-maroon/10 border-maroon/20",
					hoverColorClass: "group-hover:bg-maroon/20",
				};
			case "TASK_ASSIGNED":
				return {
					icon: ClipboardList,
					colorClass: "text-blue bg-blue/10 border-blue/20",
					hoverColorClass: "group-hover:bg-blue/20",
				};
			case "EMPLOYEE_CREATED":
				return {
					icon: UserPlus,
					colorClass: "text-mauve bg-mauve/10 border-mauve/20",
					hoverColorClass: "group-hover:bg-mauve/20",
				};
			default:
				return {
					icon: Bell,
					colorClass: "text-subtext0 bg-surface1/10 border-surface1/20",
					hoverColorClass: "group-hover:bg-surface1/20",
				};
		}
	};

	const handleNotificationClick = (notif: NotificationDto) => {
		if (!notif.read && notif.id) {
			markReadMutation.mutate({ path: { id: notif.id } });
		}

		if (notif.type === "TASK_ASSIGNED") {
			navigate({ to: "/tasks" });
		} else if (
			notif.type &&
			[
				"LEAVE_APPLIED",
				"LEAVE_APPROVED",
				"LEAVE_REJECTED",
				"WFH_APPLIED",
				"WFH_APPROVED",
				"WFH_REJECTED",
			].includes(notif.type)
		) {
			navigate({ to: "/leaves" });
		}

		setShowNotifications(false);
	};

	return (
		<header className="h-16 flex items-center justify-between px-6 border-b border-surface0/60 bg-mantle/70 backdrop-blur-md z-10">
			{/* Page Title / Breadcrumbs */}
			<div className="flex items-center gap-4">
				<h1 className="text-lg font-bold text-text font-sans tracking-tight">
					{getBreadcrumbTitle()}
				</h1>
			</div>

			{/* Top Right Utilities */}
			<div className="flex items-center gap-6">
				{/* Digital Clock */}
				<div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crust/50 border border-surface0/80 text-xs text-subtext1">
					<Clock className="h-4 w-4 text-blue" />
					<span className="font-mono text-blue font-medium">
						{formattedTime}
					</span>
					<span className="text-surface2">|</span>
					<span>{formattedDate}</span>
				</div>

				{/* Notifications Sheet Drawer */}
				<Sheet open={showNotifications} onOpenChange={setShowNotifications}>
					<SheetTrigger asChild>
						<button
							type="button"
							title="Notifications"
							className="relative p-2 rounded-full bg-surface0/80 hover:bg-surface1 border border-surface1 hover:border-surface2 text-subtext0 hover:text-text transition-all cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-mauve"
						>
							<Bell className="h-5 w-5" />
							{unreadCount > 0 && (
								<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red text-[9px] font-bold text-crust animate-pulse">
									{unreadCount}
								</span>
							)}
						</button>
					</SheetTrigger>
					<SheetContent
						side="right"
						className="w-full sm:max-w-md p-0 bg-base/90 border-l border-surface0/60 shadow-2xl flex flex-col gap-0 backdrop-blur-md"
					>
						{/* Header */}
						<SheetHeader className="flex flex-col p-4 pb-3 border-b border-surface0/60 bg-mantle/45 gap-2 pr-12">
							<div className="flex items-center gap-2">
								<SheetTitle className="text-sm font-bold uppercase tracking-wider text-subtext1">
									Notifications
								</SheetTitle>
								{unreadCount > 0 && (
									<span className="px-1.5 py-0.5 rounded-full text-[9px] bg-red/15 text-red font-bold">
										{unreadCount} new
									</span>
								)}
							</div>
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={() => markAllReadMutation.mutate({})}
									className="w-fit flex items-center gap-1.5 text-[10.5px] text-mauve hover:text-mauve/80 font-medium cursor-pointer transition-colors"
								>
									<CheckCheck className="h-3.5 w-3.5" />
									Mark all as read
								</button>
							)}
						</SheetHeader>

						{/* Tabs Filter */}
						<div className="flex border-b border-surface0/40 px-2 py-1.5 bg-crust/35 gap-1">
							{(["all", "unread", "tasks", "requests"] as const).map((tab) => {
								const count =
									tab === "unread"
										? unreadCount
										: tab === "tasks"
											? (notifications || []).filter(
													(n: NotificationDto) => n.type === "TASK_ASSIGNED",
												).length
											: tab === "requests"
												? (notifications || []).filter(
														(n: NotificationDto) =>
															n.type &&
															[
																"LEAVE_APPLIED",
																"LEAVE_APPROVED",
																"LEAVE_REJECTED",
																"WFH_APPLIED",
																"WFH_APPROVED",
																"WFH_REJECTED",
															].includes(n.type),
													).length
												: (notifications || []).length;

								return (
									<button
										type="button"
										key={tab}
										onClick={() => setActiveTab(tab)}
										className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 ${
											activeTab === tab
												? "bg-surface0/85 text-text shadow-xs"
												: "text-subtext0 hover:text-text hover:bg-surface0/30"
										}`}
									>
										{tab}
										{count > 0 && (
											<span
												className={`px-1.5 py-0.25 rounded-full text-[8px] font-bold ${
													activeTab === tab
														? "bg-mauve text-crust"
														: "bg-surface1 text-text"
												}`}
											>
												{count}
											</span>
										)}
									</button>
								);
							})}
						</div>

						{/* List Container */}
						<div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
							{filteredNotifications && filteredNotifications.length > 0 ? (
								filteredNotifications.map((notif: NotificationDto) => {
									const iconInfo = getNotificationIconInfo(notif.type);
									const IconComponent = iconInfo.icon;

									return (
										<button
											type="button"
											key={notif.id}
											onClick={() => handleNotificationClick(notif)}
											className={`w-full text-left group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
												notif.read
													? "bg-transparent hover:bg-surface0/30 border border-transparent"
													: "bg-mauve/5 hover:bg-mauve/10 border border-mauve/10 border-l-2 border-l-mauve"
											}`}
										>
											{/* Icon Badge */}
											<div
												className={`flex items-center justify-center h-8 w-8 rounded-lg border shrink-0 transition-colors ${iconInfo.colorClass} ${iconInfo.hoverColorClass}`}
											>
												<IconComponent className="h-4 w-4" />
											</div>

											{/* Text Content */}
											<div className="flex-1 min-w-0 pr-4">
												<div className="flex justify-between items-start gap-1">
													<h4 className="text-xs font-semibold text-text truncate group-hover:text-mauve transition-colors">
														{notif.title}
													</h4>
													{!notif.read && (
														<span className="h-1.5 w-1.5 rounded-full bg-mauve shrink-0 mt-1.5 animate-pulse" />
													)}
												</div>
												<p className="text-[11px] text-subtext0 mt-0.5 line-clamp-2 leading-relaxed">
													{notif.message}
												</p>
												<div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-surface2">
													<span>{formatRelativeTime(notif.createdAt)}</span>
													{notif.employeeName && (
														<>
															<span>•</span>
															<span className="font-medium text-subtext1">
																{notif.employeeName}
															</span>
														</>
													)}
												</div>
											</div>

											{/* Hover Action Indicator */}
											<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute right-3 top-1/2 -translate-y-1/2 text-mauve">
												<ChevronRight className="h-4 w-4" />
											</div>
										</button>
									);
								})
							) : (
								<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
									<div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface0/40 text-subtext0/70">
										<Bell className="h-6 w-6 stroke-[1.5]" />
										<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-surface1 animate-ping" />
									</div>
									<p className="text-xs font-semibold text-text">
										No notifications
									</p>
									<p className="text-[10px] text-subtext0 mt-1 max-w-[200px]">
										{activeTab === "all"
											? "You are all caught up! New alerts will appear here."
											: `No notifications found under the "${activeTab}" filter.`}
									</p>
								</div>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
