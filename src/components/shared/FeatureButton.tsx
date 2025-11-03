import { Button, ButtonProps } from "@/components/ui/button";
import { useFeatureAccess, FeatureTier } from "@/hooks/useFeatureAccess";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureButtonProps extends ButtonProps {
  featureName: string;
  requiredTier: FeatureTier;
  onAccessGranted?: () => void;
}

export const FeatureButton = ({
  featureName,
  requiredTier,
  onAccessGranted,
  children,
  className,
  ...props
}: FeatureButtonProps) => {
  const { checkAccess } = useFeatureAccess();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    const hasAccess = checkAccess({
      name: featureName,
      requiredTier,
      description: `${featureName} disponível apenas para assinantes`
    });

    if (hasAccess && onAccessGranted) {
      onAccessGranted();
    }
  };

  const isLocked = requiredTier !== 'free';

  return (
    <Button
      {...props}
      className={cn(
        isLocked && "relative",
        className
      )}
      onClick={handleClick}
    >
      {isLocked && (
        <Lock className="h-3 w-3 mr-2" />
      )}
      {children}
    </Button>
  );
};
