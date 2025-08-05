import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Avatar from "@/components/ui/avatar/Avatar";
import React from "react";


export default function AvatarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Avatar" />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title="Default Avatar">
          {/* Default Avatar (No Status) */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/default.png" size="xsmall" />
            <Avatar src="/images/user/default.png" size="small" />
            <Avatar src="/images/user/default.png" size="medium" />
            <Avatar src="/images/user/default.png" size="large" />
            <Avatar src="/images/user/default.png" size="xlarge" />
            <Avatar src="/images/user/default.png" size="xxlarge" />
          </div>
        </ComponentCard>
        <ComponentCard title="Avatar with online indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/default.png"
              size="xsmall"
              status="online"
            />
            <Avatar
              src="/images/user/default.png"
              size="small"
              status="online"
            />
            <Avatar
              src="/images/user/default.png"
              size="medium"
              status="online"
            />
            <Avatar
              src="/images/user/default.png"
              size="large"
              status="online"
            />
            <Avatar
              src="/images/user/default.png"
              size="xlarge"
              status="online"
            />
            <Avatar
              src="/images/user/default.png"
              size="xxlarge"
              status="online"
            />
          </div>
        </ComponentCard>
        <ComponentCard title="Avatar with Offline indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/default.png"
              size="xsmall"
              status="offline"
            />
            <Avatar
              src="/images/user/default.png"
              size="small"
              status="offline"
            />
            <Avatar
              src="/images/user/default.png"
              size="medium"
              status="offline"
            />
            <Avatar
              src="/images/user/default.png"
              size="large"
              status="offline"
            />
            <Avatar
              src="/images/user/default.png"
              size="xlarge"
              status="offline"
            />
            <Avatar
              src="/images/user/default.png"
              size="xxlarge"
              status="offline"
            />
          </div>
        </ComponentCard>{" "}
        <ComponentCard title="Avatar with busy indicator">
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/default.png"
              size="xsmall"
              status="busy"
            />
            <Avatar src="/images/user/default.png" size="small" status="busy" />
            <Avatar
              src="/images/user/default.png"
              size="medium"
              status="busy"
            />
            <Avatar src="/images/user/default.png" size="large" status="busy" />
            <Avatar
              src="/images/user/default.png"
              size="xlarge"
              status="busy"
            />
            <Avatar
              src="/images/user/default.png"
              size="xxlarge"
              status="busy"
            />
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
