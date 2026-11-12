
export const regions = ["Hamilton Mountain", "Lower Hamilton"] as const
export const sports = ["Basketball", "Baseball", "Football", "Soccer", "Bocce", "Tennis"] as const
export type Region = (typeof regions)[number]
export type Sport = (typeof sports)[number]

export const invitePolicies = ["Open", "InviteOnly"] as const
export type InvitePolicy = (typeof invitePolicies)[number]